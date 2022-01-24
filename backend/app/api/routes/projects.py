from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.project import ProjectRead, ProjectWithStats
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
