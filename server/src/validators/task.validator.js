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

const SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status'];
const MAX_LIMIT = 100;

export const validateListQuery = (query) => {
  const errors = [];
  const result = { page: 1, limit: 10, sortBy: 'createdAt', order: -1 };

  if (query.status !== undefined) {
    if (!TASK_STATUSES.includes(query.status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${TASK_STATUSES.join(', ')}` });
    } else {
      result.status = query.status;
    }
  }

  if (query.page !== undefined) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.push({ field: 'page', message: 'Page must be a positive integer' });
    } else {
      result.page = page;
    }
  }

  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      errors.push({ field: 'limit', message: `Limit must be an integer between 1 and ${MAX_LIMIT}` });
    } else {
      result.limit = limit;
    }
  }

  if (query.sortBy !== undefined) {
    if (!SORT_FIELDS.includes(query.sortBy)) {
      errors.push({ field: 'sortBy', message: `sortBy must be one of: ${SORT_FIELDS.join(', ')}` });
    } else {
      result.sortBy = query.sortBy;
    }
  }

  if (query.order !== undefined) {
    if (!['asc', 'desc'].includes(query.order)) {
      errors.push({ field: 'order', message: 'Order must be asc or desc' });
    } else {
      result.order = query.order === 'asc' ? 1 : -1;
    }
  }

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      errors.push({ field: 'search', message: 'Search must be a string' });
    } else if (query.search.trim()) {
      result.search = query.search.trim().slice(0, 100);
    }
  }

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
  return result;
};

// PATCH /:id: every field optional, but at least one required
export const validateUpdateTask = (body) => {
  const input = body ?? {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Request body must be a JSON object', 400);
  }

  const errors = [];
  const data = {};

  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || !input.title.trim()) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (input.title.trim().length > TITLE_MAX) {
      errors.push({ field: 'title', message: `Title cannot exceed ${TITLE_MAX} characters` });
    } else {
      data.title = input.title.trim();
    }
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

  if (errors.length === 0 && Object.keys(data).length === 0) {
    errors.push({ field: 'body', message: 'Provide at least one of: title, description, status' });
  }

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
  return data;
};

// PATCH /:id/status: only status, and it is required
export const validateStatusUpdate = (body) => {
  const status = body?.status;
  if (!TASK_STATUSES.includes(status)) {
    throw new AppError('Validation failed', 400, [
      { field: 'status', message: `Status must be one of: ${TASK_STATUSES.join(', ')}` },
    ]);
  }
  return { status };
};
