import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { paths } from '../routes/paths';
import { getErrorMessage } from '../utils/errors';
import { collectErrors, validateEmail } from '../utils/validation';

type Field = 'email' | 'password';

export default function LoginPage() {
  const { signIn, status, sessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={paths.dashboard} replace />;
  }

  const update = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const found = collectErrors<Field>({
      email: validateEmail(values.email),
      // Sign-in only checks presence; the API decides whether the password is right.
      password: values.password ? undefined : 'Password is required.',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signIn({ email: values.email.trim(), password: values.password });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? paths.dashboard, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to sign in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Sign in</h1>
      {sessionMessage && <Alert variant="info">{sessionMessage}</Alert>}
      {formError && <Alert>{formError}</Alert>}
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Button type="submit" className="btn-block" loading={submitting}>
          Sign in
        </Button>
      </form>
      <p className="auth-footer">
        New to TaskFlow? <Link to={paths.register}>Create an account</Link>
      </p>
    </>
  );
}
