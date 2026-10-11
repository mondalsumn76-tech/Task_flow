import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickAdd from './QuickAdd.jsx';

vi.mock('../context/toastContextValue.js', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

describe('QuickAdd', () => {
  it('shows a preview and creates a structured task on Enter', async () => {
    const onCreate = vi.fn().mockResolvedValue();
    render(<QuickAdd onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/quick add task/i), 'Call client tomorrow #work p1');
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      title: 'Call client',
      priority: 1,
      tags: ['work'],
    });
    expect(onCreate.mock.calls[0][0].dueDate).toEqual(expect.any(String));
    expect(screen.getByLabelText(/quick add task/i)).toHaveValue('');
  });

  it('does not submit when only metadata is typed', async () => {
    const onCreate = vi.fn();
    render(<QuickAdd onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText(/quick add task/i), '#work p1{Enter}');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('lets the user ignore a detected date', async () => {
    const onCreate = vi.fn().mockResolvedValue();
    render(<QuickAdd onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/quick add task/i), 'Dinner tomorrow');
    await userEvent.click(screen.getByRole('button', { name: /ignore detected date/i }));
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onCreate.mock.calls[0][0]).toEqual({ title: 'Dinner tomorrow' });
  });
});
