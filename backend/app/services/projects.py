from fastapi import HTTPException, status
from sqlalchemy import Select, case, func, select
from sqlalchemy.orm import Session

from app.models import Project, Task, TaskStatus, User
from app.schemas.project import ProjectStats


def get_owned_project(db: Session, project_id: int, user: User) -> Project:
    """Load a project the user owns, or raise 404.

    Projects owned by somebody else report 404 rather than 403 so the API does
    not confirm that the id exists.
    """
    project = db.get(Project, project_id)
    if project is None or project.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
        )
    return project


def _status_count(status_value: TaskStatus):
    return func.count(case((Task.status == status_value, 1)))


def _stats_query() -> Select:
    return select(
        func.count(Task.id).label("total_tasks"),
        _status_count(TaskStatus.TODO).label("todo"),
        _status_count(TaskStatus.IN_PROGRESS).label("in_progress"),
        _status_count(TaskStatus.DONE).label("done"),
    )


def _build_stats(
    total_tasks: int, todo: int, in_progress: int, done: int
) -> ProjectStats:
    completion = round(done / total_tasks * 100) if total_tasks else 0
    return ProjectStats(
        total_tasks=total_tasks,
        todo=todo,
        in_progress=in_progress,
        done=done,
        completion_percentage=completion,
    )


def get_project_stats(db: Session, project: Project) -> ProjectStats:
    row = db.execute(_stats_query().where(Task.project_id == project.id)).one()
    return _build_stats(*row)


def list_projects_with_stats(
    db: Session, user: User
) -> list[tuple[Project, ProjectStats]]:
    """List a user's projects and their task counts in a single query."""
    query = (
        _stats_query()
        .add_columns(Project)
        .select_from(Project)
        .outerjoin(Task, Task.project_id == Project.id)
        .where(Project.owner_id == user.id)
        .group_by(Project.id)
        .order_by(Project.created_at.desc())
    )
    return [
        (row.Project, _build_stats(row.total_tasks, row.todo, row.in_progress, row.done))
        for row in db.execute(query)
    ]
