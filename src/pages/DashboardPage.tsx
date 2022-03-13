import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatCard from '../components/StatCard';
import { useApiData } from '../hooks/useApiData';
import { useAuth } from '../hooks/useAuth';
import { paths } from '../routes/paths';
import { listProjects } from '../services/projects';
import type { ProjectWithStats } from '../types';

function summarise(projects: ProjectWithStats[]) {
  return projects.reduce(
    (totals, project) => ({
      projects: totals.projects + 1,
      tasks: totals.tasks + project.stats.total_tasks,
      completed: totals.completed + project.stats.done,
      active: totals.active + project.stats.todo + project.stats.in_progress,
    }),
    { projects: 0, tasks: 0, completed: 0, active: 0 },
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const fetcher = useCallback(() => listProjects(), []);
  const { data, status, error, reload } = useApiData(
    fetcher,
    'Unable to load your dashboard.',
  );

  const totals = data ? summarise(data) : null;

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            {user ? `Signed in as ${user.name}` : 'Your work at a glance'}
          </p>
        </div>
      </div>

      {status === 'loading' && !totals && <LoadingState />}
      {status === 'error' && error && <ErrorState message={error} onRetry={reload} />}

      {totals &&
        (totals.projects === 0 ? (
          <EmptyState message="No projects yet.">
            <Link to={paths.projects}>Create your first project</Link>
          </EmptyState>
        ) : (
          <div className="card-grid">
            <StatCard label="Projects" value={totals.projects} />
            <StatCard label="Total tasks" value={totals.tasks} />
            <StatCard label="Completed" value={totals.completed} />
            <StatCard label="Active" value={totals.active} />
          </div>
        ))}
    </section>
  );
}
