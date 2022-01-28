from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    ProjectWithStats,
)
from app.services import projects

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectWithStats])
def list_projects(current_user: CurrentUser, db: DbSession) -> list[ProjectWithStats]:
    return [
        ProjectWithStats(**ProjectRead.model_validate(project).model_dump(), stats=stats)
        for project, stats in projects.list_projects_with_stats(db, current_user)
    ]


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, current_user: CurrentUser, db: DbSession) -> ProjectRead:
    project = projects.get_owned_project(db, project_id, current_user)
    return ProjectRead.model_validate(project)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate, current_user: CurrentUser, db: DbSession
) -> ProjectRead:
    project = projects.create_project(db, current_user, payload)
    return ProjectRead.model_validate(project)


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int, payload: ProjectUpdate, current_user: CurrentUser, db: DbSession
) -> ProjectRead:
    project = projects.update_project(db, project_id, current_user, payload)
    return ProjectRead.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, current_user: CurrentUser, db: DbSession) -> None:
    projects.delete_project(db, project_id, current_user)
