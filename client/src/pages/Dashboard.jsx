import { useEffect, useState } from 'react';
import { useAuth } from '../context/authContextValue.js';
import { useToast } from '../context/toastContextValue.js';
import useTasks from '../hooks/useTasks.js';
import useFocusTrap from '../hooks/useFocusTrap.js';
import DashboardView from '../components/DashboardView.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const isTyping = (el) =>
  Boolean(el) && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable);

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const t = useTasks();

  // form: null (closed) | { task: null } (create) | { task } (edit)
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const modalOpen = Boolean(form) || Boolean(deleting);
  useFocusTrap(modalOpen);

  // Shortcuts: "n" = new task, "/" = focus search. Ignored while typing or in a dialog.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || modalOpen || isTyping(e.target)) return;
      if (e.key === 'n') {
        e.preventDefault();
        setFormError('');
        setForm({ task: null });
      } else if (e.key === '/') {
        e.preventDefault();
        document.querySelector('input[aria-label="Search tasks"]')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  const openCreate = () => {
    setFormError('');
    setForm({ task: null });
  };
  const openEdit = (task) => {
    setFormError('');
    setForm({ task });
  };
  const closeForm = () => {
    if (!submitting) setForm(null);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (form.task) {
        await t.updateTask(form.task.id, data);
        toast.success('Task updated');
      } else {
        await t.createTask(data);
        toast.success('Task created');
      }
      setForm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await t.changeStatus(id, status);
      toast.success('Status updated');
    } catch (err) {
      toast.error(`Could not change status: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await t.removeTask(deleting.id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(`Could not delete task: ${err.message}`);
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <DashboardView
        user={user}
        stats={t.stats}
        tasks={t.tasks}
        loading={t.loading}
        error={t.error}
        onRetry={t.reload}
        onEdit={openEdit}
        onDelete={setDeleting}
        onStatusChange={handleStatusChange}
        search={t.filters.search}
        onSearchChange={t.setSearch}
        filter={t.filters.filter}
        onFilterChange={t.setFilter}
        sortBy={t.filters.sortBy}
        order={t.filters.order}
        onSortChange={t.setSort}
        page={t.filters.page}
        totalPages={t.meta.totalPages}
        onPageChange={t.setPage}
        onAddTask={openCreate}
      />

      {form && (
        <TaskForm
          key={form.task?.id ?? 'new'}
          initial={form.task}
          onSubmit={handleSubmit}
          onCancel={closeForm}
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
    </>
  );
}
