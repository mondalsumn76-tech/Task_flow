import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const current = Math.max(1, Math.min(page, totalPages));

  function getPages() {
    const pages = [];
    const show = 1;
    const left = Math.max(1, current - show);
    const right = Math.min(totalPages, current + show);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('...');
    }
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  const pages = getPages();

  function buttonClass(active) {
    return `flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;
  }

  const navButton =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        aria-label="Previous page"
        className={navButton}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === current ? 'page' : undefined}
            className={buttonClass(p === current)}
          >
            {p}
          </button>
        ) : (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
            aria-hidden="true"
          >
            ...
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(current + 1)}
        disabled={current >= totalPages}
        aria-label="Next page"
        className={navButton}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
