import { AppError } from '../utils/AppError.js';
import { TASK_STATUSES } from '../models/Task.js';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

// Returns ONLY the fields we allow. Anything else the client sends
// (like "user" or "_id") is dropped.
export const validateCreateTask = (body) => {
  const input = body ?? {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Request body must be a JSON object', 400);
  }

  const errors = [];
  const data = {};

  if (typeof input.title !== 'string' || !input.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (input.title.trim().length > TITLE_MAX) {
    errors.push({ field: 'title', message: `Title cannot exceed ${TITLE_MAX} characters` });
  } else {
    data.title = input.title.trim();
  }

  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (input.description.trim().length > DESCRIPTION_MAX) {
      errors.push({ field: 'description', message: `Description cannot exceed ${DESCRIPTION_MAX} characters` });
    } else {
      data.description = input.description.trim();
    }
  }

  if (input.status !== undefined) {
    if (!TASK_STATUSES.includes(input.status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${TASK_STATUSES.join(', ')}` });
    } else {
      data.status = input.status;
    }
  }

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
  return data;
};
