import axios from 'axios';

const TOKEN_KEY = 'taskflow.token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
});

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let sessionExpiredHandler: (() => void) | null = null;

/** Lets the auth provider react when the API rejects a token we still hold. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isExpiredSession =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      getStoredToken() !== null;

    if (isExpiredSession) {
      clearStoredToken();
      sessionExpiredHandler?.();
    }
    return Promise.reject(error);
  },
);
