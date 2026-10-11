import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import TaskMeta from './TaskMeta.jsx';
import { COLUMNS } from '../utils/boardColumns.js';

const iconButton =
  'flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-200';

function CardBody({ task, handle, onMove, onEdit, onDelete }) {
  const interactive = Boolean(onMove);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-2">
        {handle}
        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-sm font-medium ${
              task.status === 'done'
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
          )}
          <TaskMeta task={task} />
        </div>
        {interactive && (
          <div className="flex shrink-0 items-center">
            <button type="button" onClick={() => onEdit(task)} aria-label={`Edit task ${task.title}`} className={iconButton}>
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete task ${task.title}`}
              className={`${iconButton} hover:text-red-600 dark:hover:text-red-400`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {interactive && (
        <select
          value={task.status}
          onChange={(e) => onMove(task.id, e.target.value)}
          aria-label={`Move ${task.title} to`}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          {COLUMNS.map((c) => (
            <option key={c.id} value={c.id}>
              Move to: {c.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

const grip = <GripVertical className="h-4 w-4" aria-hidden="true" />;

// Mouse and touch users drag by the grip. Keyboard users use the Move select.
export function DraggableCard({ task, onMove, onEdit, onDelete }) {
  const { listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div ref={setNodeRef} className={isDragging ? 'opacity-40' : ''}>
      <CardBody
        task={task}
        onMove={onMove}
        onEdit={onEdit}
        onDelete={onDelete}
        handle={
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            aria-hidden="true"
            className="mt-0.5 cursor-grab touch-none text-slate-300 hover:text-slate-500 dark:text-slate-600"
          >
            {grip}
          </div>
        }
      />
    </div>
  );
}

// What follows the pointer while dragging
export function CardPreview({ task }) {
  return (
    <div className="rotate-1 shadow-xl">
      <CardBody task={task} handle={<div className="mt-0.5 text-slate-400">{grip}</div>} />
    </div>
  );
}
