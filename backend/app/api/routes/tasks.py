from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.models import TaskStatus
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
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
    project_id: int,
    current_user: CurrentUser,
    db: DbSession,
    status_filter: Annotated[TaskStatus | None, Query(alias="status")] = None,
    search: Annotated[str | None, Query(max_length=120)] = None,
) -> list[TaskRead]:
    project = projects.get_owned_project(db, project_id, current_user)
    found = tasks.list_tasks(db, project, status_filter=status_filter, search=search)
    return [TaskRead.model_validate(task) for task in found]


@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int, payload: TaskUpdate, current_user: CurrentUser, db: DbSession
) -> TaskRead:
    return TaskRead.model_validate(tasks.update_task(db, task_id, current_user, payload))


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, current_user: CurrentUser, db: DbSession) -> None:
    tasks.delete_task(db, task_id, current_user)
