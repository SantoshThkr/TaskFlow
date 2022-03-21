import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { useApiData } from '../hooks/useApiData';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { paths } from '../routes/paths';
import { getProject, getProjectStats } from '../services/projects';
import { createTask, deleteTask, listTasks, updateTask } from '../services/tasks';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../types';
import type { Task, TaskPayload, TaskStatus } from '../types';

type Dialog = { kind: 'create' } | { kind: 'edit'; task: Task } | { kind: 'delete'; task: Task };

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const headerFetcher = useCallback(async () => {
    const [project, stats] = await Promise.all([getProject(id), getProjectStats(id)]);
    return { project, stats };
  }, [id]);
  const header = useApiData(headerFetcher, 'Unable to load this project.');

  const tasksFetcher = useCallback(
    () => listTasks(id, { status: statusFilter, search: debouncedSearch }),
    [id, statusFilter, debouncedSearch],
  );
  const taskList = useApiData(tasksFetcher, 'Unable to load tasks.');

  const closeDialog = useCallback(() => setDialog(null), []);

  const refresh = useCallback(() => {
    taskList.reload();
    header.reload();
  }, [taskList, header]);

  const handleCreate = async (payload: TaskPayload) => {
    await createTask(id, payload);
    closeDialog();
    refresh();
  };

  const handleUpdate = async (taskId: number, payload: TaskPayload) => {
    await updateTask(taskId, payload);
    closeDialog();
    refresh();
  };

  const handleDelete = async (taskId: number) => {
    await deleteTask(taskId);
    closeDialog();
    refresh();
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    setActionError(null);
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status,
      });
      refresh();
    } catch {
      setActionError('Unable to update task status.');
    }
  };

  const isFiltered = statusFilter !== '' || debouncedSearch.trim() !== '';
  const tasks = taskList.data ?? [];

  if (Number.isNaN(id)) {
    return <ErrorState message="That project link is not valid." />;
  }

  return (
    <section>
      <p className="breadcrumb">
        <Link to={paths.projects}>Projects</Link>
      </p>

      {header.status === 'loading' && header.data === null && <LoadingState />}
      {header.status === 'error' && header.error && (
        <ErrorState message={header.error} onRetry={header.reload} />
      )}

      {header.data && (
        <>
          <div className="page-header">
            <div>
              <h1>{header.data.project.name}</h1>
              {header.data.project.description && (
                <p className="page-subtitle">{header.data.project.description}</p>
              )}
            </div>
            <Button onClick={() => setDialog({ kind: 'create' })}>New task</Button>
          </div>

          <div className="card-grid stats-row">
            <StatCard label="Total tasks" value={header.data.stats.total_tasks} />
            <StatCard label="To do" value={header.data.stats.todo} />
            <StatCard label="In progress" value={header.data.stats.in_progress} />
            <StatCard
              label="Complete"
              value={`${header.data.stats.completion_percentage}%`}
            />
          </div>

          <div className="filter-bar">
            <input
              className="field-input"
              type="search"
              value={search}
              placeholder="Search tasks"
              aria-label="Search tasks"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="field-input status-select"
              value={statusFilter}
              aria-label="Filter by status"
              onChange={(event) => setStatusFilter(event.target.value as TaskStatus | '')}
            >
              <option value="">All statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {actionError && <Alert>{actionError}</Alert>}

          {taskList.status === 'loading' && taskList.data === null && <LoadingState />}
          {taskList.status === 'error' && taskList.error && (
            <ErrorState message={taskList.error} onRetry={taskList.reload} />
          )}

          {taskList.data !== null &&
            (tasks.length === 0 ? (
              <EmptyState
                message={
                  isFiltered
                    ? 'No tasks match your search.'
                    : 'No tasks in this project.'
                }
              />
            ) : (
              <ul className="task-list">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => handleStatusChange(task, status)}
                    onEdit={() => setDialog({ kind: 'edit', task })}
                    onDelete={() => setDialog({ kind: 'delete', task })}
                  />
                ))}
              </ul>
            ))}
        </>
      )}

      {dialog?.kind === 'create' && (
        <Modal title="New task" onClose={closeDialog}>
          <TaskForm
            submitLabel="Create task"
            errorMessage="Unable to create task."
            onSubmit={handleCreate}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.kind === 'edit' && (
        <Modal title="Edit task" onClose={closeDialog}>
          <TaskForm
            task={dialog.task}
            submitLabel="Save changes"
            errorMessage="Unable to update task."
            onSubmit={(payload) => handleUpdate(dialog.task.id, payload)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete "${dialog.task.title}"? This cannot be undone.`}
          confirmLabel="Delete task"
          errorMessage="Unable to delete task."
          onConfirm={() => handleDelete(dialog.task.id)}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
