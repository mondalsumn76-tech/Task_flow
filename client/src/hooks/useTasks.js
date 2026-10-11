import { useCallback, useEffect, useRef, useState } from 'react';
import { taskService } from '../services/api.js';
import { dueFilterParams } from '../utils/dateRanges.js';
import useDebounce from './useDebounce.js';

const LIMIT = 10;

export default function useTasks() {
  const [filters, setFilters] = useState({
    search: '',
    filter: 'all',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    due: 'all',
    priority: 'all',
    tag: '',
  });
  const debouncedSearch = useDebounce(filters.search, 350);
  const debouncedTag = useDebounce(filters.tag, 350);

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [stats, setStats] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const { filter, sortBy, order, page, due, priority } = filters;

  // Only the newest request may update state, so a slow old response
  // can never overwrite a newer one (race condition guard).
  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      setError('');
      try {
        const res = await taskService.list({
          page,
          limit: LIMIT,
          status: filter === 'all' ? undefined : filter,
          search: debouncedSearch.trim() || undefined,
          sortBy,
          order,
          priority: priority === 'all' ? undefined : priority,
          tag: debouncedTag.trim().replace(/^#/, '').toLowerCase() || undefined,
          ...dueFilterParams(due),
        });
        if (id !== requestId.current) return;
        setTasks(res.data);
        setMeta(res.meta);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(err.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [page, filter, debouncedSearch, sortBy, order, due, priority, debouncedTag]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await taskService.stats();
      setStats(res.data);
    } catch {
      // Stats are secondary: the task list shows its own error state
    }
  }, []);

  useEffect(() => {
    // Fetching on mount and when filters change is intended here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(
    () => Promise.all([load({ silent: true }), loadStats()]),
    [load, loadStats]
  );

  // Filter setters reset to page 1, otherwise you could sit on an empty page 5
  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const setSearch = (search) => update({ search });
  const setFilter = (next) => update({ filter: next });
  const setSort = (nextSortBy, nextOrder) => update({ sortBy: nextSortBy, order: nextOrder });
  const setDue = (next) => update({ due: next });
  const setPriority = (next) => update({ priority: next });
  const setTag = (next) => update({ tag: next });
  const setPage = (next) => setFilters((f) => ({ ...f, page: next }));

  // Mutations throw on failure, so the caller can show the message
  const createTask = async (data) => {
    await taskService.create(data);
    await refresh();
  };

  const updateTask = async (id, data) => {
    await taskService.update(id, data);
    await refresh();
  };

  // Optimistic: the UI changes instantly and rolls back if the API fails
  const changeStatus = async (id, status) => {
    const previous = tasks;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await taskService.setStatus(id, status);
      await refresh();
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  };

  const removeTask = async (id) => {
    await taskService.remove(id);
    // Deleted the last item on this page: step back one page
    if (tasks.length === 1 && page > 1) {
      setPage(page - 1);
      await loadStats();
    } else {
      await refresh();
    }
  };

  return {
    tasks,
    meta,
    stats,
    loading,
    error,
    filters,
    reload: () => load(),
    setSearch,
    setFilter,
    setSort,
    setDue,
    setPriority,
    setTag,
    setPage,
    createTask,
    updateTask,
    changeStatus,
    removeTask,
  };
}
