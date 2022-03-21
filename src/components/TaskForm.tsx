import { useState } from 'react';
import { getErrorMessage } from '../utils/errors';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  collectErrors,
  validateOptionalText,
  validateText,
} from '../utils/validation';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../types';
import type { Task, TaskPayload, TaskStatus } from '../types';
import Alert from './Alert';
import Button from './Button';
import SelectField from './SelectField';
import TextAreaField from './TextAreaField';
import TextField from './TextField';

interface TaskFormProps {
  task?: Task;
  submitLabel: string;
  errorMessage: string;
  onSubmit: (payload: TaskPayload) => Promise<void>;
  onCancel: () => void;
}

type Field = 'title' | 'description';

const statusOptions = TASK_STATUSES.map((status) => ({
  value: status,
  label: TASK_STATUS_LABELS[status],
}));

export default function TaskForm({
  task,
  submitLabel,
  errorMessage,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const found = collectErrors<Field>({
      title: validateText(title, 'Title', MAX_TITLE_LENGTH),
      description: validateOptionalText(
        description,
        'Description',
        MAX_DESCRIPTION_LENGTH,
      ),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
    } catch (error) {
      setFormError(getErrorMessage(error, errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && <Alert>{formError}</Alert>}
      <TextField
        label="Title"
        value={title}
        autoFocus
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
      />
      <SelectField
        label="Status"
        value={status}
        options={statusOptions}
        onChange={(event) => setStatus(event.target.value as TaskStatus)}
      />
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
