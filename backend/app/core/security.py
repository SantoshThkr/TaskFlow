from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import get_settings

# bcrypt refuses inputs longer than this, so registration rejects them up front.
MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=get_settings().bcrypt_rounds)
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        # Malformed stored hash, or a password longer than bcrypt accepts.
        return False


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    issued_at = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "iat": issued_at,
        "exp": issued_at + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    """Return the user id in a valid token, or raise jwt.InvalidTokenError."""
    settings = get_settings()
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        options={"require": ["exp", "sub"]},
    )
    try:
        return int(payload["sub"])
    except (TypeError, ValueError) as exc:
        raise jwt.InvalidTokenError("Token subject is not a user id") from exc
