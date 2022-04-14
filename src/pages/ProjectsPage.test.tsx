import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as projectService from '../services/projects';
import type { ProjectWithStats } from '../types';
import ProjectsPage from './ProjectsPage';

vi.mock('../services/projects');

const mockedProjects = vi.mocked(projectService);

const project: ProjectWithStats = {
  id: 1,
  name: 'Website redesign',
  description: 'Marketing site',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  stats: {
    total_tasks: 4,
    todo: 2,
    in_progress: 1,
    done: 1,
    completion_percentage: 25,
  },
};

function renderProjects() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>,
  );
}

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows an empty state when there are no projects', async () => {
    mockedProjects.listProjects.mockResolvedValue([]);
    renderProjects();

    expect(await screen.findByText('No projects yet.')).toBeInTheDocument();
  });

  it('lists projects with their progress', async () => {
    mockedProjects.listProjects.mockResolvedValue([project]);
    renderProjects();

    expect(await screen.findByRole('link', { name: 'Website redesign' })).toBeInTheDocument();
    expect(screen.getByText(/4 tasks/)).toBeInTheDocument();
    expect(screen.getByText(/25% complete/)).toBeInTheDocument();
  });

  it('explains why the list could not be loaded', async () => {
    mockedProjects.listProjects.mockRejectedValue(new Error('offline'));
    renderProjects();

    expect(await screen.findByText('Unable to load projects.')).toBeInTheDocument();
  });

  it('creates a project and refreshes the list', async () => {
    const user = userEvent.setup();
    mockedProjects.listProjects.mockResolvedValue([]);
    mockedProjects.createProject.mockResolvedValue({
      ...project,
      name: 'Mobile app',
    });
    renderProjects();

    await user.click(await screen.findByRole('button', { name: 'New project' }));
    await user.type(screen.getByLabelText('Name'), 'Mobile app');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() =>
      expect(mockedProjects.createProject).toHaveBeenCalledWith({
        name: 'Mobile app',
        description: null,
      }),
    );
    expect(mockedProjects.listProjects).toHaveBeenCalledTimes(2);
  });

  it('keeps the dialog open and reports a failed creation', async () => {
    const user = userEvent.setup();
    mockedProjects.listProjects.mockResolvedValue([]);
    mockedProjects.createProject.mockRejectedValue(new Error('boom'));
    renderProjects();

    await user.click(await screen.findByRole('button', { name: 'New project' }));
    await user.type(screen.getByLabelText('Name'), 'Mobile app');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(await screen.findByText('Unable to create project.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('requires a project name', async () => {
    const user = userEvent.setup();
    mockedProjects.listProjects.mockResolvedValue([]);
    renderProjects();

    await user.click(await screen.findByRole('button', { name: 'New project' }));
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(mockedProjects.createProject).not.toHaveBeenCalled();
  });
});
