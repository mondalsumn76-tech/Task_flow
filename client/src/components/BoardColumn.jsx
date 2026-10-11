import { useDroppable } from '@dnd-kit/core';
import { DraggableCard } from './BoardCard.jsx';

export default function BoardColumn({ column, tasks, onMove, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      aria-label={column.title}
      className={`flex min-h-48 flex-col rounded-2xl border p-3 transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40'
          : 'border-slate-200 bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/40'
      }`}
    >
      <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
        {column.title}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          {tasks.length}
        </span>
      </h2>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-600 dark:text-slate-500">
            Drop tasks here
          </p>
        )}
      </div>
    </section>
  );
}
