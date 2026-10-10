import * as taskService from '../services/task.service.js';
import {
  validateCreateTask,
  validateListQuery,
  validateUpdateTask,
  validateStatusUpdate,
} from '../validators/task.validator.js';
import { toTaskResponse } from '../utils/taskSerializer.js';

export const createTask = async (req, res) => {
  const data = validateCreateTask(req.body);
  const task = await taskService.createTask(req.user.id, data);

  res.status(201).json({ success: true, data: toTaskResponse(task) });
};

export const listTasks = async (req, res) => {
  const query = validateListQuery(req.query);
  const { tasks, meta } = await taskService.listTasks(req.user.id, query);

  res.status(200).json({ success: true, data: tasks.map(toTaskResponse), meta });
};

export const getTask = async (req, res) => {
  const task = await taskService.getTask(req.user.id, req.params.id);

  res.status(200).json({ success: true, data: toTaskResponse(task) });
};

export const updateTask = async (req, res) => {
  const data = validateUpdateTask(req.body);
  const task = await taskService.updateTask(req.user.id, req.params.id, data);

  res.status(200).json({ success: true, data: toTaskResponse(task) });
};

export const updateTaskStatus = async (req, res) => {
  const data = validateStatusUpdate(req.body);
  const task = await taskService.updateTask(req.user.id, req.params.id, data);

  res.status(200).json({ success: true, data: toTaskResponse(task) });
};

export const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.user.id, req.params.id);

  res.status(204).send();
};

export const getTaskStats = async (req, res) => {
  const stats = await taskService.getTaskStats(req.user.id);

  res.status(200).json({ success: true, data: stats });
};
