from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, Task, User
from app.schemas.task import TaskCreate, TaskUpdate


def list_tasks(db: Session, project: Project) -> list[Task]:
    query = (
        select(Task)
        .where(Task.project_id == project.id)
        .order_by(Task.created_at.desc(), Task.id.desc())
    )
    return list(db.scalars(query))


def create_task(db: Session, project: Project, payload: TaskCreate) -> Task:
    task = Task(
        project_id=project.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_owned_task(db: Session, task_id: int, user: User) -> Task:
    """Load a task through its project so another user's task reports 404."""
    query = (
        select(Task)
        .join(Project, Task.project_id == Project.id)
        .where(Task.id == task_id, Project.owner_id == user.id)
    )
    task = db.scalar(query)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found."
        )
    return task


def update_task(db: Session, task_id: int, user: User, payload: TaskUpdate) -> Task:
    task = get_owned_task(db, task_id, user)
    task.title = payload.title
    task.description = payload.description
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, user: User) -> None:
    task = get_owned_task(db, task_id, user)
    db.delete(task)
    db.commit()
