import type {
  Project,
  ProjectPayload,
  ProjectStats,
  ProjectWithStats,
} from '../types';
import { api } from './apiClient';

export async function listProjects(): Promise<ProjectWithStats[]> {
  const { data } = await api.get<ProjectWithStats[]>('/api/projects');
  return data;
}

export async function getProject(projectId: number): Promise<Project> {
  const { data } = await api.get<Project>(`/api/projects/${projectId}`);
  return data;
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const { data } = await api.post<Project>('/api/projects', payload);
  return data;
}

export async function updateProject(
  projectId: number,
  payload: ProjectPayload,
): Promise<Project> {
  const { data } = await api.put<Project>(`/api/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/api/projects/${projectId}`);
}

export async function getProjectStats(projectId: number): Promise<ProjectStats> {
  const { data } = await api.get<ProjectStats>(`/api/projects/${projectId}/stats`);
  return data;
}
