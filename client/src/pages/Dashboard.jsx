import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
      <p className="mt-1 text-slate-500">Dashboard coming in the next step.</p>
    </div>
  );
}
