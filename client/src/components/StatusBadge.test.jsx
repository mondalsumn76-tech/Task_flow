import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge.jsx';

describe('StatusBadge', () => {
  it.each([
    ['todo', 'To do'],
    ['in-progress', 'In progress'],
    ['done', 'Done'],
  ])('shows the label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
