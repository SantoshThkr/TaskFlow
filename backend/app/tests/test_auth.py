from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings

REGISTRATION = {
    "name": "Nina Patel",
    "email": "nina@example.com",
    "password": "supersecret",
}


def test_register_creates_account(client):
    response = client.post("/auth/register", json=REGISTRATION)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "nina@example.com"
    assert body["name"] == "Nina Patel"
    assert "password" not in body and "password_hash" not in body


def test_register_normalises_email_case(client):
    client.post("/auth/register", json={**REGISTRATION, "email": "Nina@Example.com"})

    login = client.post(
        "/auth/login", json={"email": "nina@example.com", "password": "supersecret"}
    )
    assert login.status_code == 200


def test_register_rejects_duplicate_email(client):
    client.post("/auth/register", json=REGISTRATION)

    response = client.post("/auth/register", json=REGISTRATION)

    assert response.status_code == 409
    assert response.json()["detail"] == "An account with this email already exists."


def test_register_validates_input(client):
    assert (
        client.post("/auth/register", json={**REGISTRATION, "email": "nope"}).status_code
        == 422
    )
    assert (
        client.post(
            "/auth/register", json={**REGISTRATION, "password": "short"}
        ).status_code
        == 422
    )
    assert (
        client.post("/auth/register", json={**REGISTRATION, "name": "   "}).status_code
        == 422
    )


def test_login_returns_a_bearer_token(client):
    client.post("/auth/register", json=REGISTRATION)

    response = client.post(
        "/auth/login", json={"email": "nina@example.com", "password": "supersecret"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    claims = jwt.decode(
        body["access_token"], get_settings().jwt_secret, algorithms=["HS256"]
    )
    assert claims["sub"].isdigit()


def test_login_rejects_wrong_password(client):
    client.post("/auth/register", json=REGISTRATION)

    response = client.post(
        "/auth/login", json={"email": "nina@example.com", "password": "not-the-one"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."


def test_login_does_not_reveal_unknown_accounts(client):
    response = client.post(
        "/auth/login", json={"email": "ghost@example.com", "password": "supersecret"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."


def test_me_returns_the_signed_in_user(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["email"] == "nina@example.com"


def test_me_requires_a_token(client):
    assert client.get("/auth/me").status_code == 401


def test_me_rejects_an_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer nonsense"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials."


def test_me_rejects_an_expired_token(client):
    expired = jwt.encode(
        {"sub": "1", "exp": datetime.now(UTC) - timedelta(minutes=1)},
        get_settings().jwt_secret,
        algorithm="HS256",
    )

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {expired}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Session expired."


def test_me_rejects_a_token_signed_with_another_secret(client):
    forged = jwt.encode(
        {"sub": "1", "exp": datetime.now(UTC) + timedelta(minutes=5)},
        "a-different-secret-that-is-long-enough",
        algorithm="HS256",
    )

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {forged}"})

    assert response.status_code == 401
