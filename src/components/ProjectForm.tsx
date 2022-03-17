import { useState } from 'react';
import { getErrorMessage } from '../utils/errors';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  collectErrors,
  validateOptionalText,
  validateText,
} from '../utils/validation';
import type { Project, ProjectPayload } from '../types';
import Alert from './Alert';
import Button from './Button';
import TextAreaField from './TextAreaField';
import TextField from './TextField';

interface ProjectFormProps {
  project?: Project;
  submitLabel: string;
  errorMessage: string;
  onSubmit: (payload: ProjectPayload) => Promise<void>;
  onCancel: () => void;
}

type Field = 'name' | 'description';

export default function ProjectForm({
  project,
  submitLabel,
  errorMessage,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const found = collectErrors<Field>({
      name: validateText(name, 'Name', MAX_TITLE_LENGTH),
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
        name: name.trim(),
        description: description.trim() || null,
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
        label="Name"
        value={name}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
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
