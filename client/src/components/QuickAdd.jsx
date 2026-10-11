import { useMemo, useState } from 'react';
import { CalendarDays, Flag, Loader2, Plus, X } from 'lucide-react';
import { useToast } from '../context/toastContextValue.js';
import { parseQuickAdd } from '../utils/parseQuickAdd.js';

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const formatDue = (iso) => {
  const d = new Date(iso);
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime ? `${dateFormatter.format(d)}, ${timeFormatter.format(d)}` : dateFormatter.format(d);
};

const chip =
  'inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';

export default function QuickAdd({ onCreate }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [ignoreDate, setIgnoreDate] = useState(false);
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(
    () => parseQuickAdd(text, new Date(), { parseDate: !ignoreDate }),
    [text, ignoreDate]
  );
  const hasInput = text.trim().length > 0;

  const submit = async () => {
    if (busy || !parsed.title) return;
    setBusy(true);
    try {
      await onCreate({
        title: parsed.title,
        ...(parsed.priority && { priority: parsed.priority }),
        ...(parsed.dueDate && { dueDate: parsed.dueDate }),
        ...(parsed.tags.length > 0 && { tags: parsed.tags }),
      });
      toast.success(`Added "${parsed.title}"`);
      setText('');
      setIgnoreDate(false);
    } catch (err) {
      toast.error(`Could not add task: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            aria-label="Quick add task"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            maxLength={300}
            placeholder='Quick add: "Call client tomorrow at 3pm #work p1"'
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={busy || !parsed.title}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-800"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Add
        </button>
      </div>

      {hasInput && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" aria-live="polite">
          <span className="text-slate-500 dark:text-slate-400">
            {parsed.title ? (
              <>Title: <strong className="text-slate-700 dark:text-slate-200">{parsed.title}</strong></>
            ) : (
              'Add a title'
            )}
          </span>
          {parsed.dueDate && (
            <span className={chip}>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDue(parsed.dueDate)}
              <button
                type="button"
                onClick={() => setIgnoreDate(true)}
                aria-label="Ignore detected date"
                className="rounded-full hover:text-indigo-900 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {parsed.priority && (
            <span className={chip}>
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />P{parsed.priority}
            </span>
          )}
          {parsed.tags.map((tag) => (
            <span key={tag} className={chip}>#{tag}</span>
          ))}
          {ignoreDate && (
            <button
              type="button"
              onClick={() => setIgnoreDate(false)}
              className="text-indigo-600 underline dark:text-indigo-400"
            >
              Detect date again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
