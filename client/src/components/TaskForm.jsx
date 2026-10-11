import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const MAX_TITLE = 120;
const MAX_DESC = 2000;

const statusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: '1', label: 'P1 Urgent' },
  { value: '2', label: 'P2 High' },
  { value: '3', label: 'P3 Medium' },
  { value: '4', label: 'P4 None' },
];

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

// The date input works in local "YYYY-MM-DD"; the API stores a full ISO timestamp.
const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fromDateInput = (value) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);
const parseTags = (text) =>
  text
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, '').toLowerCase())
    .filter(Boolean);

function TaskForm({ initial, onSubmit, onCancel, submitting, error }) {
  const isEdit = !!initial;
  const titleRef = useRef(null);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'todo');
  const [priority, setPriority] = useState(String(initial?.priority ?? 4));
  const [dueDate, setDueDate] = useState(toDateInput(initial?.dueDate));
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(' '));

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, submitting]);

  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority: Number(priority),
      dueDate: fromDateInput(dueDate),
      tags: parseTags(tagsText),
    });
  }

  const titleEmpty = title.trim().length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl dark:bg-slate-800 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 id="task-form-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              maxLength={MAX_TITLE}
              required
              disabled={submitting}
              placeholder="What needs to be done?"
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <span
                className={`text-xs tabular-nums ${
                  description.length > MAX_DESC * 0.9
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {description.length} / {MAX_DESC}
              </span>
            </div>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
              maxLength={MAX_DESC}
              rows={3}
              disabled={submitting}
              placeholder="Add more detail..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="task-status" className={labelClass}>
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
                className={`${inputClass} cursor-pointer`}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className={labelClass}>
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting}
                className={`${inputClass} cursor-pointer`}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-due" className={labelClass}>
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-tags" className={labelClass}>
              Tags
            </label>
            <input
              id="task-tags"
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              disabled={submitting}
              placeholder="work home (separate with spaces or commas)"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || titleEmpty}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-800"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
