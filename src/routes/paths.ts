export const paths = {
  login: '/login',
  register: '/register',
  dashboard: '/',
  projects: '/projects',
  project: (projectId: number | string) => `/projects/${projectId}`,
  profile: '/profile',
} as const;
