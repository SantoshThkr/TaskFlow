import { TASK_STATUSES, TASK_STATUS_LABELS } from '../types';
import type { Task, TaskStatus } from '../types';
import Button from './Button';

interface TaskItemProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <li className="task-item">
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="muted task-description">{task.description}</p>}
      </div>
      <div className="task-controls">
        <label className="visually-hidden" htmlFor={`status-${task.id}`}>
          Status for {task.title}
        </label>
        <select
          id={`status-${task.id}`}
          className="field-input status-select"
          value={task.status}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}
