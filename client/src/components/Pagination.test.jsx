import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination.jsx';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('goes to the next and previous page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();

    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });
});
