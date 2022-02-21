import { createContext } from 'react';
import type { Credentials, RegisterPayload, User } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Set when a request failed because the stored token was no longer valid. */
  sessionMessage: string | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
