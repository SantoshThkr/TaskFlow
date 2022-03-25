import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { paths } from '../routes/paths';
import { formatDate } from '../utils/formatDate';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <LoadingState />;
  }

  const handleSignOut = () => {
    signOut();
    navigate(paths.login, { replace: true });
  };

  return (
    <section>
      <div className="page-header">
        <h1>Profile</h1>
      </div>
      <div className="card profile-card">
        <dl className="profile-details">
          <dt>Name</dt>
          <dd>{user.name}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Member since</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </dl>
        <Button variant="secondary" onClick={handleSignOut}>
          Log out
        </Button>
      </div>
    </section>
  );
}
