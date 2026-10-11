import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskMeta from './TaskMeta.jsx';

const DAY = 24 * 60 * 60 * 1000;

describe('TaskMeta', () => {
  it('renders nothing for a task without extras', () => {
    const { container } = render(<TaskMeta task={{ status: 'todo', priority: 4, dueDate: null, tags: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows priority and tags', () => {
    render(<TaskMeta task={{ status: 'todo', priority: 1, dueDate: null, tags: ['work'] }} />);
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
  });

  it('flags an unfinished past-due task as overdue', () => {
    const dueDate = new Date(Date.now() - 2 * DAY).toISOString();
    render(<TaskMeta task={{ status: 'todo', priority: 4, dueDate, tags: [] }} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('does not flag a finished task as overdue', () => {
    const dueDate = new Date(Date.now() - 2 * DAY).toISOString();
    render(<TaskMeta task={{ status: 'done', priority: 4, dueDate, tags: [] }} />);
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });
});
