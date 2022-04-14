import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthProvider from '../hooks/AuthProvider';
import * as authService from '../services/auth';
import LoginPage from './LoginPage';

vi.mock('../services/auth');

const mockedAuth = vi.mocked(authService);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('reports invalid input without calling the API', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockedAuth.login).not.toHaveBeenCalled();
  });

  it('signs the user in and shows the dashboard', async () => {
    const user = userEvent.setup();
    mockedAuth.login.mockResolvedValue('token-123');
    mockedAuth.fetchCurrentUser.mockResolvedValue({
      id: 1,
      name: 'Nina',
      email: 'nina@example.com',
      created_at: '2026-01-01T00:00:00Z',
    });
    renderLogin();

    await user.type(screen.getByLabelText('Email'), ' nina@example.com ');
    await user.type(screen.getByLabelText('Password'), 'supersecret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(mockedAuth.login).toHaveBeenCalledWith({
      email: 'nina@example.com',
      password: 'supersecret',
    });
  });

  it('shows the error returned by the API', async () => {
    const user = userEvent.setup();
    mockedAuth.login.mockRejectedValue(new Error('request failed'));
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'nina@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Unable to sign in. Please try again.'),
    ).toBeInTheDocument();
  });
});
