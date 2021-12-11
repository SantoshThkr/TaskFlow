import { describe, expect, it } from 'vitest';
import {
  collectErrors,
  validateEmail,
  validateOptionalText,
  validatePassword,
  validateText,
} from './validation';

describe('validateEmail', () => {
  it('rejects empty and malformed addresses', () => {
    expect(validateEmail('')).toBe('Email is required.');
    expect(validateEmail('  ')).toBe('Email is required.');
    expect(validateEmail('nina@')).toBe('Enter a valid email address.');
    expect(validateEmail('nina@example')).toBe('Enter a valid email address.');
  });

  it('accepts a well formed address', () => {
    expect(validateEmail('nina@example.com')).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('requires at least eight characters', () => {
    expect(validatePassword('short')).toBe(
      'Password must be at least 8 characters.',
    );
    expect(validatePassword('longenough')).toBeUndefined();
  });

  it('rejects passwords beyond the bcrypt input limit', () => {
    expect(validatePassword('a'.repeat(73))).toBe(
      'Password must be at most 72 characters.',
    );
  });
});

describe('text validators', () => {
  it('requires a value and enforces a length limit', () => {
    expect(validateText('  ', 'Name', 10)).toBe('Name is required.');
    expect(validateText('a'.repeat(11), 'Name', 10)).toBe(
      'Name must be at most 10 characters.',
    );
    expect(validateText('Website', 'Name', 10)).toBeUndefined();
  });

  it('allows optional text to be blank', () => {
    expect(validateOptionalText('', 'Description', 10)).toBeUndefined();
    expect(validateOptionalText('a'.repeat(11), 'Description', 10)).toBe(
      'Description must be at most 10 characters.',
    );
  });
});

describe('collectErrors', () => {
  it('keeps only the fields that failed', () => {
    expect(collectErrors({ email: undefined, password: 'Required.' })).toEqual({
      password: 'Required.',
    });
  });
});
