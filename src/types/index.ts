export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface ProjectStats {
  total_tasks: number;
  todo: number;
  in_progress: number;
  done: number;
  completion_percentage: number;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape returned by the project list, which carries per-project task counts. */
export interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  name: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface ProjectPayload {
  name: string;
  description: string | null;
}

export interface TaskPayload {
  title: string;
  description: string | null;
  status: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  search?: string;
}
