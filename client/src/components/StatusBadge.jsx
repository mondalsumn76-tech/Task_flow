const statusConfig = {
  todo: {
    label: 'To do',
    className:
      'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800',
  },
  'in-progress': {
    label: 'In progress',
    className:
      'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800',
  },
  done: {
    label: 'Done',
    className:
      'bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800',
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.todo;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}

export default StatusBadge;
