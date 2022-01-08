from fastapi import APIRouter, status

from app.api.deps import DbSession
from app.models import User
from app.schemas.user import UserCreate, UserRead
from app.services import users

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbSession) -> User:
    return users.register_user(db, payload)
