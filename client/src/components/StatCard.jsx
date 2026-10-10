import { LayoutList, Clock, Loader, CheckCircle2 } from 'lucide-react';

const toneMap = {
  slate: {
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    ring: 'ring-slate-200 dark:ring-slate-700',
    value: 'text-slate-900 dark:text-slate-50',
    label: 'text-slate-500 dark:text-slate-400',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    ring: 'ring-amber-200 dark:ring-amber-800',
    value: 'text-slate-900 dark:text-slate-50',
    label: 'text-slate-500 dark:text-slate-400',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    ring: 'ring-blue-200 dark:ring-blue-800',
    value: 'text-slate-900 dark:text-slate-50',
    label: 'text-slate-500 dark:text-slate-400',
  },
  green: {
    icon: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    ring: 'ring-green-200 dark:ring-green-800',
    value: 'text-slate-900 dark:text-slate-50',
    label: 'text-slate-500 dark:text-slate-400',
  },
};

const iconMap = {
  total: LayoutList,
  todo: Clock,
  'in-progress': Loader,
  done: CheckCircle2,
};

function StatCard({ label, value, icon, tone = 'slate' }) {
  const styles = toneMap[tone] || toneMap.slate;
  const Icon = icon || iconMap[label?.toLowerCase()?.replace(/\s+/g, '-')] || LayoutList;
  const isLoading = value === undefined || value === null;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ${styles.ring} transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
          {isLoading ? (
            <div className="mt-1.5 h-7 w-12 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
          ) : (
            <p className={`text-2xl font-bold tabular-nums ${styles.value}`}>{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
