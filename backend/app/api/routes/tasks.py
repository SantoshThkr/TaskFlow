from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.task import TaskCreate, TaskRead
from app.services import projects, tasks

router = APIRouter(prefix="/api", tags=["tasks"])


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    project_id: int, payload: TaskCreate, current_user: CurrentUser, db: DbSession
) -> TaskRead:
    project = projects.get_owned_project(db, project_id, current_user)
    return TaskRead.model_validate(tasks.create_task(db, project, payload))


@router.get("/projects/{project_id}/tasks", response_model=list[TaskRead])
def list_tasks(
    project_id: int, current_user: CurrentUser, db: DbSession
) -> list[TaskRead]:
    project = projects.get_owned_project(db, project_id, current_user)
    return [TaskRead.model_validate(task) for task in tasks.list_tasks(db, project)]
