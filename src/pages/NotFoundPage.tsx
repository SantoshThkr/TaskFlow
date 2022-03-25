import { Link } from 'react-router-dom';
import { paths } from '../routes/paths';

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to={paths.dashboard}>Back to dashboard</Link>
    </section>
  );
}
