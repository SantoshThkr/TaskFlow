import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthProvider from '../hooks/AuthProvider';
import AppRoutes from './AppRoutes';

vi.mock('../services/auth');

describe('protected routes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sends anonymous visitors to the sign in screen', async () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});
