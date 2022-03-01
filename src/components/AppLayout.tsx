import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { paths } from '../routes/paths';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link-active' : 'nav-link';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to={paths.dashboard} className="brand">
            TaskFlow
          </NavLink>
          <nav className="nav">
            <NavLink to={paths.dashboard} end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to={paths.projects} className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to={paths.profile} className={navLinkClass}>
              Profile
            </NavLink>
          </nav>
          {user && <span className="header-user">{user.name}</span>}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
