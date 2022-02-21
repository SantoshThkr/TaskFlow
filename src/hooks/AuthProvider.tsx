import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearStoredToken,
  getStoredToken,
  setSessionExpiredHandler,
  storeToken,
} from '../services/apiClient';
import * as authService from '../services/auth';
import type { Credentials, RegisterPayload, User } from '../types';
import { AuthContext } from './authContext';
import type { AuthStatus } from './authContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    getStoredToken() ? 'loading' : 'anonymous',
  );
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('anonymous');
      setSessionMessage('Your session expired. Please sign in again.');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      return;
    }

    let active = true;
    authService
      .fetchCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        clearStoredToken();
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback(async (token: string) => {
    storeToken(token);
    const currentUser = await authService.fetchCurrentUser();
    setUser(currentUser);
    setStatus('authenticated');
    setSessionMessage(null);
  }, []);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const token = await authService.login(credentials);
      await startSession(token);
    },
    [startSession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      const token = await authService.login({
        email: payload.email,
        password: payload.password,
      });
      await startSession(token);
    },
    [startSession],
  );

  const signOut = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setStatus('anonymous');
    setSessionMessage(null);
  }, []);

  const value = useMemo(
    () => ({ user, status, sessionMessage, signIn, signUp, signOut }),
    [user, status, sessionMessage, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
