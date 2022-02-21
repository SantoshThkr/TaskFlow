import type { AuthToken, Credentials, RegisterPayload, User } from '../types';
import { api } from './apiClient';

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function login(credentials: Credentials): Promise<string> {
  const { data } = await api.post<AuthToken>('/auth/login', credentials);
  return data.access_token;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
