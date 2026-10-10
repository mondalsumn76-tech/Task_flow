import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Logged out -> /login. Waits for the session check first, so a refresh
// doesn't flash the login page for users who are actually logged in.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Logged in -> /dashboard. Keeps signed-in users off the login and register pages.
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Checking session" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
