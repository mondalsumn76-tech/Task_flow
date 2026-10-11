import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { AppError } from '../utils/AppError.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const notFound = () => new AppError('Task not found', 404);

// "user" is set LAST so input data can never override the owner.
export const createTask = (userId, data) => Task.create({ ...data, user: userId });

export const listTasks = async (
  userId,
  { status, search, priority, tag, dueFrom, dueTo, overdue, noDue, page, limit, sortBy, order }
) => {
  const filter = { user: userId };
  if (status) filter.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  // Priority 4 means "none", which older tasks may not have stored at all
  if (priority) filter.priority = priority === 4 ? { $in: [4, null] } : priority;
  if (tag) filter.tags = tag;

  if (noDue) {
    filter.dueDate = null; // matches null and missing
  } else if (overdue) {
    filter.dueDate = { $lt: new Date() };
    if (!status) filter.status = { $ne: 'done' }; // finished tasks are never overdue
  } else if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) filter.dueDate.$gte = dueFrom;
    if (dueTo) filter.dueDate.$lt = dueTo;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortBy]: order, _id: order })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw notFound();
  return task;
};

// Used by both PATCH /:id and PATCH /:id/status
export const updateTask = async (userId, taskId, data) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );
  if (!task) throw notFound();
  return task;
};

export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) throw notFound();
};

// One aggregation instead of three count queries. The pipeline is scoped to the
// owner, and aggregate() does not auto-cast ids, so we convert it ourselves.
export const getTaskStats = async (userId) => {
  const rows = await Task.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const todo = counts.todo ?? 0;
  const inProgress = counts['in-progress'] ?? 0;
  const done = counts.done ?? 0;
  return { total: todo + inProgress + done, todo, inProgress, done };
};
