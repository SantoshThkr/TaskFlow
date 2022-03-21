import type { Task, TaskFilters, TaskPayload } from '../types';
import { api } from './apiClient';

export async function listTasks(
  projectId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filters.status) {
    params.status = filters.status;
  }
  const search = filters.search?.trim();
  if (search) {
    params.search = search;
  }

  const { data } = await api.get<Task[]>(`/api/projects/${projectId}/tasks`, {
    params,
  });
  return data;
}

export async function createTask(
  projectId: number,
  payload: TaskPayload,
): Promise<Task> {
  const { data } = await api.post<Task>(`/api/projects/${projectId}/tasks`, payload);
  return data;
}

export async function updateTask(taskId: number, payload: TaskPayload): Promise<Task> {
  const { data } = await api.put<Task>(`/api/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/api/tasks/${taskId}`);
}
