export const MAX_NAME_LENGTH = 80;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export function validateText(
  value: string,
  label: string,
  maxLength: number,
): string | undefined {
  const text = value.trim();
  if (!text) return `${label} is required.`;
  if (text.length > maxLength) {
    return `${label} must be at most ${maxLength} characters.`;
  }
  return undefined;
}

export function validateOptionalText(
  value: string,
  label: string,
  maxLength: number,
): string | undefined {
  if (value.trim().length > maxLength) {
    return `${label} must be at most ${maxLength} characters.`;
  }
  return undefined;
}

/** Drops empty error entries so a form can check `hasErrors`. */
export function collectErrors<T extends string>(
  errors: Partial<Record<T, string | undefined>>,
): Partial<Record<T, string>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as Partial<Record<T, string>>;
}
