import { Search, ArrowDownUp } from 'lucide-react';

const filterPills = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Date created' },
  { value: 'title', label: 'Title' },
  { value: 'updatedAt', label: 'Date updated' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
];

function Toolbar({ search, onSearchChange, status, onStatusChange, sortBy, order, onSortChange }) {
  function handleSortClick() {
    onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, order)}
            aria-label="Sort by"
            className="cursor-pointer rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-3 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSortClick}
            aria-label={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowDownUp className={`h-4 w-4 transition-transform ${order === 'asc' ? 'scale-y-[-1]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => {
          const active = status === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => onStatusChange(pill.value)}
              aria-pressed={active}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Toolbar;
