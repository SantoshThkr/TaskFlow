import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

export type LoadStatus = 'loading' | 'success' | 'error';

interface ApiData<T> {
  data: T | null;
  status: LoadStatus;
  error: string | null;
  reload: () => void;
}

/**
 * Loads data for a screen and tracks its loading and error state.
 * `fetcher` must be wrapped in useCallback so the request only reruns when its
 * inputs actually change. When inputs change the previous result stays on
 * screen until the new one arrives, which keeps filtering from flickering.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  errorMessage: string,
): ApiData<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;

    fetcher()
      .then((result) => {
        // Ignore responses from requests that a newer one has replaced.
        if (currentRequest !== requestId.current) return;
        setData(result);
        setError(null);
        setStatus('success');
      })
      .catch((caught: unknown) => {
        if (currentRequest !== requestId.current) return;
        setError(getErrorMessage(caught, errorMessage));
        setStatus('error');
      });
  }, [fetcher, errorMessage, reloadCount]);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadCount((count) => count + 1);
  }, []);

  return { data, status, error, reload };
}
