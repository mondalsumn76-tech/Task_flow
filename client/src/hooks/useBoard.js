import { useCallback, useEffect, useRef, useState } from 'react';
import { taskService } from '../services/api.js';
import { COLUMNS } from '../utils/boardColumns.js';

const LIMIT = 100;
const EMPTY = { todo: [], 'in-progress': [], done: [] };

export default function useBoard() {
  const [columns, setColumns] = useState(EMPTY);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  // Only the newest request may update state
  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        COLUMNS.map((c) => taskService.list({ status: c.id, limit: LIMIT }))
      );
      if (id !== requestId.current) return;

      const next = {};
      let cut = false;
      COLUMNS.forEach((c, i) => {
        next[c.id] = results[i].data;
        if (results[i].meta.total > results[i].data.length) cut = true;
      });
      setColumns(next);
      setTruncated(cut);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetching on mount is intended here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Optimistic: the card moves instantly and snaps back if the API fails
  const move = async (id, to) => {
    const from = COLUMNS.find((c) => columns[c.id].some((t) => t.id === id))?.id;
    if (!from || from === to) return;

    const task = columns[from].find((t) => t.id === id);
    const previous = columns;
    setColumns((c) => ({
      ...c,
      [from]: c[from].filter((t) => t.id !== id),
      [to]: [{ ...task, status: to }, ...c[to]],
    }));

    try {
      await taskService.setStatus(id, to);
    } catch (err) {
      setColumns(previous);
      throw err;
    }
  };

  const createTask = async (data) => {
    await taskService.create(data);
    await load({ silent: true });
  };

  const updateTask = async (id, data) => {
    await taskService.update(id, data);
    await load({ silent: true });
  };

  const removeTask = async (id) => {
    await taskService.remove(id);
    await load({ silent: true });
  };

  return {
    columns,
    truncated,
    loading,
    error,
    reload: () => load(),
    move,
    createTask,
    updateTask,
    removeTask,
  };
}
