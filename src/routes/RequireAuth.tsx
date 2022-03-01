import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { paths } from './paths';

export default function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState label="Checking your session..." />;
  }

  if (status === 'anonymous') {
    return (
      <Navigate to={paths.login} state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
}
