import { CalendarDays, Flag } from 'lucide-react';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const priorityStyle = {
  1: 'text-red-600 dark:text-red-400',
  2: 'text-orange-500 dark:text-orange-400',
  3: 'text-blue-600 dark:text-blue-400',
};

export default function TaskMeta({ task }) {
  const { priority = 4, dueDate, tags = [], status } = task;
  if (priority === 4 && !dueDate && tags.length === 0) return null;

  const overdue = Boolean(dueDate) && status !== 'done' && new Date(dueDate) < new Date();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      {priority < 4 && (
        <span className={`inline-flex items-center gap-1 font-medium ${priorityStyle[priority]}`}>
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />P{priority}
        </span>
      )}
      {dueDate && (
        <span
          className={`inline-flex items-center gap-1 ${
            overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {dateFormatter.format(new Date(dueDate))}
          {overdue && ' · Overdue'}
        </span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
