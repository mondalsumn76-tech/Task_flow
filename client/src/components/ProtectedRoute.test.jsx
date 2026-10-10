import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute.jsx';
import { useAuth } from '../context/authContextValue.js';

vi.mock('../context/authContextValue.js', () => ({ useAuth: vi.fn() }));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<p>Login page</p>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Secret dashboard</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('route guards', () => {
  beforeEach(() => vi.resetAllMocks());

  it('redirects a logged-out visitor from /dashboard to /login', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderAt('/dashboard');
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });

  it('lets a logged-in user see /dashboard', () => {
    useAuth.mockReturnValue({ user: { name: 'A' }, loading: false });
    renderAt('/dashboard');
    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
  });

  it('redirects a logged-in user away from /login', () => {
    useAuth.mockReturnValue({ user: { name: 'A' }, loading: false });
    renderAt('/login');
    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
  });

  it('shows a spinner, not the login page, while the session is checked', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    renderAt('/dashboard');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
