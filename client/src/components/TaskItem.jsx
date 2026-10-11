import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import TaskMeta from './TaskMeta.jsx';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const statusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

function TaskItem({ task, onStatusChange, onEdit, onDelete }) {
  const isDone = task.status === 'done';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold ${
                isDone
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
          </div>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
          )}
          <TaskMeta task={task} />
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Created {dateFormatter.format(new Date(task.createdAt))}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            aria-label={`Change status for ${task.title}`}
            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-2 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit task ${task.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete task ${task.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
