import axios from 'axios';

interface ValidationIssue {
  msg?: string;
}

/** Turns an API failure into a sentence we can show a user. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  const detail = error.response.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const message = (detail[0] as ValidationIssue).msg;
    if (message) {
      return message.replace(/^Value error, /, '');
    }
  }

  return fallback;
}
