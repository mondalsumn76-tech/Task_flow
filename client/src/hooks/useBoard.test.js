import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { taskService } from '../services/api.js';
import useBoard from './useBoard.js';

vi.mock('../services/api.js', () => ({
  taskService: {
    list: vi.fn(),
    setStatus: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const task = { id: 'a', title: 'A', status: 'todo' };

beforeEach(() => {
  vi.resetAllMocks();
  taskService.list.mockImplementation(({ status }) => {
    const data = status === 'todo' ? [task] : [];
    return Promise.resolve({ data, meta: { total: data.length } });
  });
});

const ready = async () => {
  const hook = renderHook(() => useBoard());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('useBoard', () => {
  it('loads one column per status', async () => {
    const { result } = await ready();
    expect(result.current.columns.todo).toHaveLength(1);
    expect(result.current.columns.done).toHaveLength(0);
    expect(taskService.list).toHaveBeenCalledTimes(3);
  });

  it('moves a card to the top of the new column and saves the status', async () => {
    taskService.setStatus.mockResolvedValue({});
    const { result } = await ready();

    await act(async () => {
      await result.current.move('a', 'done');
    });

    expect(result.current.columns.todo).toHaveLength(0);
    expect(result.current.columns.done[0]).toMatchObject({ id: 'a', status: 'done' });
    expect(taskService.setStatus).toHaveBeenCalledWith('a', 'done');
  });

  it('puts the card back and throws when the API fails', async () => {
    taskService.setStatus.mockRejectedValue(new Error('boom'));
    const { result } = await ready();

    await act(async () => {
      await expect(result.current.move('a', 'done')).rejects.toThrow('boom');
    });

    expect(result.current.columns.todo).toHaveLength(1);
    expect(result.current.columns.done).toHaveLength(0);
  });

  it('ignores a move to the same column', async () => {
    const { result } = await ready();
    await act(async () => {
      await result.current.move('a', 'todo');
    });
    expect(taskService.setStatus).not.toHaveBeenCalled();
  });
});
