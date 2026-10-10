import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js';

const router = Router();

router.use(protect);

router.route('/').post(createTask).get(listTasks);

router.route('/:id').get(validateObjectId, getTask).patch(validateObjectId, updateTask).delete(validateObjectId, deleteTask);

router.patch('/:id/status', validateObjectId, updateTaskStatus);

export default router;
