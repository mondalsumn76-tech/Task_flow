import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
        Back to dashboard
      </Link>
    </main>
  );
}
