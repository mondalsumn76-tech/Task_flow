import { Plus, ListTodo, Clock, Loader, CheckCircle2 } from 'lucide-react';
import StatCard from './StatCard.jsx';
import Toolbar from './Toolbar.jsx';
import TaskList from './TaskList.jsx';
import Pagination from './Pagination.jsx';

function DashboardView({
  user,
  stats,
  tasks,
  loading,
  error,
  actionError,
  onDismissActionError,
  onRetry,
  onEdit,
  onDelete,
  onStatusChange,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  order,
  onSortChange,
  page,
  totalPages,
  onPageChange,
  onAddTask,
}) {
  const name = user?.name || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {greeting}, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s an overview of your tasks and progress.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats?.total} icon={ListTodo} tone="slate" />
        <StatCard label="To do" value={stats?.todo} icon={Clock} tone="amber" />
        <StatCard label="In progress" value={stats?.inProgress} icon={Loader} tone="blue" />
        <StatCard label="Done" value={stats?.done} icon={CheckCircle2} tone="green" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">My Tasks</h2>
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800"
          >
            <span>{actionError}</span>
            <button type="button" onClick={onDismissActionError} className="font-medium underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-4">
          <Toolbar
            search={search}
            onSearchChange={onSearchChange}
            status={filter}
            onStatusChange={onFilterChange}
            sortBy={sortBy}
            order={order}
            onSortChange={onSortChange}
          />
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />

        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
