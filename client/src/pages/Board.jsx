import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useToast } from '../context/toastContextValue.js';
import useBoard from '../hooks/useBoard.js';
import useFocusTrap from '../hooks/useFocusTrap.js';
import { COLUMNS } from '../utils/boardColumns.js';
import BoardColumn from '../components/BoardColumn.jsx';
import { CardPreview } from '../components/BoardCard.jsx';
import QuickAdd from '../components/QuickAdd.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Board() {
  const toast = useToast();
  const b = useBoard();

  const [activeTask, setActiveTask] = useState(null);
  const [form, setForm] = useState(null); // null | { task }
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useFocusTrap(Boolean(form) || Boolean(deleting));
  // A small drag distance keeps clicks on buttons and selects working
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findTask = (id) => Object.values(b.columns).flat().find((t) => t.id === id) ?? null;

  const handleMove = async (id, to) => {
    try {
      await b.move(id, to);
    } catch (err) {
      toast.error(`Could not move task: ${err.message}`);
    }
  };

  const onDragStart = ({ active }) => setActiveTask(findTask(active.id));
  const onDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (over) handleMove(active.id, over.id);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      await b.updateTask(form.task.id, data);
      toast.success('Task updated');
      setForm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await b.removeTask(deleting.id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(`Could not delete task: ${err.message}`);
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Board</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Drag a card by its grip to change its status, or use the Move menu on the card.
        </p>
      </div>

      <QuickAdd onCreate={b.createTask} />

      {b.truncated && (
        <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Showing the newest 100 tasks per column. Use the Dashboard to browse the rest.
        </p>
      )}

      {b.loading ? (
        <Spinner label="Loading board" />
      ) : b.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{b.error}</p>
          <button
            type="button"
            onClick={b.reload}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveTask(null)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={b.columns[column.id]}
                onMove={handleMove}
                onEdit={(task) => {
                  setFormError('');
                  setForm({ task });
                }}
                onDelete={setDeleting}
              />
            ))}
          </div>
          <DragOverlay>{activeTask ? <CardPreview task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      )}

      {form && (
        <TaskForm
          key={form.task.id}
          initial={form.task}
          onSubmit={handleSubmit}
          onCancel={() => !submitting && setForm(null)}
          submitting={submitting}
          error={formError}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this task?"
        message={deleting ? `"${deleting.title}" will be permanently deleted.` : ''}
        confirmLabel="Delete"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
