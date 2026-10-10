import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContextValue.js';
import AuthCard from '../components/AuthCard.jsx';
import Field from '../components/Field.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form); // PublicRoute redirects to /dashboard once the user is set
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your TaskFlow account"
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        <Field label="Email" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
        <Field label="Password" id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} required />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  );
}
