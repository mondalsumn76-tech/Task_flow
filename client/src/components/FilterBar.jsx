import { CalendarDays, Flag, Tag } from 'lucide-react';

const field =
  'rounded-lg border border-slate-300 bg-white py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200';

export default function FilterBar({ due, onDueChange, priority, onPriorityChange, tag, onTagChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <select
          aria-label="Filter by due date"
          value={due}
          onChange={(e) => onDueChange(e.target.value)}
          className={`${field} px-2`}
        >
          <option value="all">Any date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="week">Next 7 days</option>
          <option value="none">No date</option>
        </select>
      </label>

      <label className="flex items-center gap-1.5">
        <Flag className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className={`${field} px-2`}
        >
          <option value="all">Any priority</option>
          <option value="1">P1 Urgent</option>
          <option value="2">P2 High</option>
          <option value="3">P3 Medium</option>
          <option value="4">P4 None</option>
        </select>
      </label>

      <label className="flex items-center gap-1.5">
        <Tag className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          aria-label="Filter by tag"
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          placeholder="tag"
          maxLength={30}
          className={`${field} w-28 px-2 placeholder-slate-400`}
        />
      </label>
    </div>
  );
}
