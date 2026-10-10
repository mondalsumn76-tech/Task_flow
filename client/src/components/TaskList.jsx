import { AlertCircle, ClipboardList, RotateCw } from 'lucide-react';
import TaskItem from './TaskItem.jsx';

const bar = 'animate-pulse rounded bg-slate-200 dark:bg-slate-700';

function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`${bar} h-4 w-48`} />
            <div className={`${bar} h-5 w-20 rounded-full`} />
          </div>
          <div className={`${bar} mt-2 h-3 w-full`} />
          <div className={`${bar} mt-1.5 h-3 w-2/3`} />
          <div className={`${bar} mt-3 h-3 w-32`} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className={`${bar} h-8 w-28 rounded-lg`} />
          <div className={`${bar} h-8 w-8 rounded-lg`} />
          <div className={`${bar} h-8 w-8 rounded-lg`} />
        </div>
      </div>
    </div>
  );
}

function TaskList({ tasks, loading, error, onRetry, onEdit, onDelete, onStatusChange }) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading tasks">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
        <AlertCircle className="h-10 w-10 text-red-400 dark:text-red-500" />
        <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <RotateCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <ClipboardList className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-200">No tasks found</p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Click &quot;Add task&quot; to create one, or adjust your search and filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
