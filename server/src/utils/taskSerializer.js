// Explicit whitelist of what the API exposes. Never returns "user".
export const toTaskResponse = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  tags: task.tags,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});
