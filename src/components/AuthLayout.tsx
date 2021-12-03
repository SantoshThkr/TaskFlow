import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="brand brand-auth">TaskFlow</p>
        <Outlet />
      </div>
    </div>
  );
}
