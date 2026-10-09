import { Router } from 'express';
import { tempUser } from '../middleware/tempUser.js';
import { createTask } from '../controllers/task.controller.js';

const router = Router();

router.use(tempUser);
router.post('/', createTask);

export default router;
