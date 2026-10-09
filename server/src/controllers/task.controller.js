import * as taskService from '../services/task.service.js';
import { validateCreateTask } from '../validators/task.validator.js';
import { toTaskResponse } from '../utils/taskSerializer.js';

export const createTask = async (req, res) => {
  const data = validateCreateTask(req.body);
  const task = await taskService.createTask(req.user.id, data);

  res.status(201).json({ success: true, data: toTaskResponse(task) });
};
