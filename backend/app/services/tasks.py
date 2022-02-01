from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, Task
from app.schemas.task import TaskCreate


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
