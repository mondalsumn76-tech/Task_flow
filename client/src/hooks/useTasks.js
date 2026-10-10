import { useCallback, useEffect, useRef, useState } from 'react';
import { taskService } from '../services/api.js';
import useDebounce from './useDebounce.js';

const LIMIT = 10;

export default function useTasks() {
  const [filters, setFilters] = useState({
    search: '',
    filter: 'all',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  });
  const debouncedSearch = useDebounce(filters.search, 350);

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [stats, setStats] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const { filter, sortBy, order, page } = filters;

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
    [page, filter, debouncedSearch, sortBy, order]
  );

  const loadStats = useCallback(async () => {
    try {
      const [todo, inProgress, done] = await Promise.all(
        ['todo', 'in-progress', 'done'].map((status) => taskService.list({ status, limit: 1 }))
      );
      setStats({
        todo: todo.meta.total,
        inProgress: inProgress.meta.total,
        done: done.meta.total,
        total: todo.meta.total + inProgress.meta.total + done.meta.total,
      });
    } catch {
      // Stats are secondary: the task list shows its own error state
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(
    () => Promise.all([load({ silent: true }), loadStats()]),
    [load, loadStats]
  );

  // Filter setters reset to page 1, otherwise you could sit on an empty page 5
  const setSearch = (search) => setFilters((f) => ({ ...f, search, page: 1 }));
  const setFilter = (next) => setFilters((f) => ({ ...f, filter: next, page: 1 }));
  const setSort = (nextSortBy, nextOrder) =>
    setFilters((f) => ({ ...f, sortBy: nextSortBy, order: nextOrder, page: 1 }));
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
    setPage,
    createTask,
    updateTask,
    changeStatus,
    removeTask,
  };
}
