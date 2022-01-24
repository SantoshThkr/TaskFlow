from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectWrite(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Name is required")
        return name

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        description = value.strip()
        return description or None


class ProjectCreate(ProjectWrite):
    pass


class ProjectUpdate(ProjectWrite):
    pass


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime


class ProjectStats(BaseModel):
    total_tasks: int
    todo: int
    in_progress: int
    done: int
    completion_percentage: int


class ProjectWithStats(ProjectRead):
    stats: ProjectStats
