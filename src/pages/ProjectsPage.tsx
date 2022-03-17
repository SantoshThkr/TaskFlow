import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import { useApiData } from '../hooks/useApiData';
import { paths } from '../routes/paths';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../services/projects';
import type { ProjectPayload, ProjectWithStats } from '../types';

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; project: ProjectWithStats }
  | { kind: 'delete'; project: ProjectWithStats };

export default function ProjectsPage() {
  const fetcher = useCallback(() => listProjects(), []);
  const { data, status, error, reload } = useApiData(
    fetcher,
    'Unable to load projects.',
  );
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleCreate = async (payload: ProjectPayload) => {
    await createProject(payload);
    closeDialog();
    reload();
  };

  const handleUpdate = async (projectId: number, payload: ProjectPayload) => {
    await updateProject(projectId, payload);
    closeDialog();
    reload();
  };

  const handleDelete = async (projectId: number) => {
    await deleteProject(projectId);
    closeDialog();
    reload();
  };

  const projects = data ?? [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Group related tasks into a project.</p>
        </div>
        <Button onClick={() => setDialog({ kind: 'create' })}>New project</Button>
      </div>

      {status === 'loading' && data === null && <LoadingState />}
      {status === 'error' && error && <ErrorState message={error} onRetry={reload} />}

      {data !== null &&
        (projects.length === 0 ? (
          <EmptyState message="No projects yet." />
        ) : (
          <div className="card-grid">
            {projects.map((project) => (
              <article key={project.id} className="card project-card">
                <h2 className="project-name">
                  <Link to={paths.project(project.id)}>{project.name}</Link>
                </h2>
                {project.description && (
                  <p className="muted project-description">{project.description}</p>
                )}
                <p className="muted">
                  {project.stats.total_tasks} tasks &middot;{' '}
                  {project.stats.completion_percentage}% complete
                </p>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuenow={project.stats.completion_percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${project.name} completion`}
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${project.stats.completion_percentage}%` }}
                  />
                </div>
                <div className="card-actions">
                  <Button
                    variant="secondary"
                    onClick={() => setDialog({ kind: 'edit', project })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDialog({ kind: 'delete', project })}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ))}

      {dialog?.kind === 'create' && (
        <Modal title="New project" onClose={closeDialog}>
          <ProjectForm
            submitLabel="Create project"
            errorMessage="Unable to create project."
            onSubmit={handleCreate}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.kind === 'edit' && (
        <Modal title="Edit project" onClose={closeDialog}>
          <ProjectForm
            project={dialog.project}
            submitLabel="Save changes"
            errorMessage="Unable to update project."
            onSubmit={(payload) => handleUpdate(dialog.project.id, payload)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Delete project"
          message={`Deleting "${dialog.project.name}" also deletes its ${dialog.project.stats.total_tasks} task(s). This cannot be undone.`}
          confirmLabel="Delete project"
          errorMessage="Unable to delete project."
          onConfirm={() => handleDelete(dialog.project.id)}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
