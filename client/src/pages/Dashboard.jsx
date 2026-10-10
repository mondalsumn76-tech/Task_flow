import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import useTasks from '../hooks/useTasks.js';
import DashboardView from '../components/DashboardView.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const t = useTasks();

  // form: null (closed) | { task: null } (create) | { task } (edit)
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState('');

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
      if (form.task) await t.updateTask(form.task.id, data);
      else await t.createTask(data);
      setForm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionError('');
    try {
      await t.changeStatus(id, status);
    } catch (err) {
      setActionError(`Could not change status: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await t.removeTask(deleting.id);
      setDeleting(null);
    } catch (err) {
      setDeleting(null);
      setActionError(`Could not delete task: ${err.message}`);
    } finally {
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
        actionError={actionError}
        onDismissActionError={() => setActionError('')}
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
