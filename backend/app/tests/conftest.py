import os

# The application reads its configuration at import time, so the test settings
# have to be in place before anything from app.* is imported.
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-long-enough-to-pass")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.api.deps import get_db  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enforce_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def client(db_session: Session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register_and_login(client: TestClient, email: str, password: str = "supersecret"):
    """Create an account and return its Authorization header."""
    client.post(
        "/auth/register", json={"name": "Test User", "email": email, "password": password}
    )
    token = client.post(
        "/auth/login", json={"email": email, "password": password}
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    return register_and_login(client, "nina@example.com")


@pytest.fixture
def other_auth_headers(client: TestClient) -> dict[str, str]:
    return register_and_login(client, "omar@example.com")


@pytest.fixture
def project_id(client: TestClient, auth_headers: dict[str, str]) -> int:
    response = client.post(
        "/api/projects",
        json={"name": "Website redesign", "description": "Marketing site"},
        headers=auth_headers,
    )
    return response.json()["id"]
