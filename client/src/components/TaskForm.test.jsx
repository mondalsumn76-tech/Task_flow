import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm.jsx';

describe('TaskForm', () => {
  it('disables the submit button until a title is entered', async () => {
    render(<TaskForm onSubmit={() => {}} onCancel={() => {}} />);
    const submit = screen.getByRole('button', { name: /create task/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/title/i), 'Buy milk');
    expect(submit).toBeEnabled();
  });

  it('submits trimmed values', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={() => {}} />);

    await userEvent.type(screen.getByLabelText(/title/i), '  Buy milk  ');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Buy milk', description: '', status: 'todo', priority: 4, dueDate: null, tags: [] });
  });

  it('prefills and says "Edit task" when editing', () => {
    const task = { id: '1', title: 'Existing', description: 'Notes', status: 'done' };
    render(<TaskForm initial={task} onSubmit={() => {}} onCancel={() => {}} />);

    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing');
  });

  it('shows a server error message', () => {
    render(<TaskForm error="Title is required" onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
  });

  it('calls onCancel on Escape', async () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={() => {}} onCancel={onCancel} />);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});
