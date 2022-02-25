import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { paths } from '../routes/paths';
import { getErrorMessage } from '../utils/errors';
import {
  MAX_NAME_LENGTH,
  collectErrors,
  validateEmail,
  validatePassword,
  validateText,
} from '../utils/validation';

type Field = 'name' | 'email' | 'password';

export default function RegisterPage() {
  const { signUp, status } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
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
      name: validateText(values.name, 'Name', MAX_NAME_LENGTH),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate(paths.dashboard, { replace: true });
    } catch (error) {
      setFormError(
        getErrorMessage(error, 'Unable to create your account. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Create your account</h1>
      {formError && <Alert>{formError}</Alert>}
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Name"
          autoComplete="name"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
        />
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
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Button type="submit" className="btn-block" loading={submitting}>
          Create account
        </Button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to={paths.login}>Sign in</Link>
      </p>
    </>
  );
}
