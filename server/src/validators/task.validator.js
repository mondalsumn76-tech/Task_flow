import { AppError } from '../utils/AppError.js';
import { TASK_STATUSES, MAX_TAGS } from '../models/Task.js';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;
const TAG_MAX = 30;
const MAX_LIMIT = 100;
const SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'status', 'dueDate', 'priority'];
const TAG_RE = /^[\p{L}\p{N}_-]+$/u;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const STATUS_MESSAGE = `Status must be one of: ${TASK_STATUSES.join(', ')}`;

const asObject = (body) => {
  const input = body ?? {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Request body must be a JSON object', 400);
  }
  return input;
};

// Only accepts ISO-style strings, so "tomorrow" or numbers are rejected
const parseDate = (value) => {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeTags = (value, errors) => {
  const tagError = (message) => {
    errors.push({ field: 'tags', message });
    return undefined;
  };
  if (!Array.isArray(value)) return tagError('Tags must be an array of strings');

  const tags = [];
  for (const raw of value) {
    if (typeof raw !== 'string') return tagError('Tags must be an array of strings');
    const tag = raw.trim().replace(/^#/, '').toLowerCase();
    if (!tag) continue;
    if (tag.length > TAG_MAX || !TAG_RE.test(tag)) {
      return tagError(`Tags may only contain letters, numbers, - and _ (max ${TAG_MAX} characters)`);
    }
    if (!tags.includes(tag)) tags.push(tag);
  }
  if (tags.length > MAX_TAGS) return tagError(`At most ${MAX_TAGS} tags`);
  return tags;
};

// Shared by create and update. Returns ONLY whitelisted, cleaned fields.
const readFields = (input, errors, { requireTitle }) => {
  const data = {};

  if (requireTitle || input.title !== undefined) {
    if (typeof input.title !== 'string' || !input.title.trim()) {
      errors.push({ field: 'title', message: requireTitle ? 'Title is required' : 'Title cannot be empty' });
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
    if (!TASK_STATUSES.includes(input.status)) errors.push({ field: 'status', message: STATUS_MESSAGE });
    else data.status = input.status;
  }

  if (input.priority !== undefined) {
    if (!Number.isInteger(input.priority) || input.priority < 1 || input.priority > 4) {
      errors.push({ field: 'priority', message: 'Priority must be a whole number from 1 to 4' });
    } else {
      data.priority = input.priority;
    }
  }

  if (input.dueDate !== undefined) {
    if (input.dueDate === null) {
      data.dueDate = null; // clears the due date
    } else {
      const date = parseDate(input.dueDate);
      if (!date) errors.push({ field: 'dueDate', message: 'Due date must be an ISO date string or null' });
      else data.dueDate = date;
    }
  }

  if (input.tags !== undefined) {
    const tags = normalizeTags(input.tags, errors);
    if (tags) data.tags = tags;
  }

  return data;
};

export const validateCreateTask = (body) => {
  const errors = [];
  const data = readFields(asObject(body), errors, { requireTitle: true });
  if (errors.length > 0) throw new AppError('Validation failed', 400, errors);
  return data;
};

// PATCH /:id: every field optional, but at least one required
export const validateUpdateTask = (body) => {
  const errors = [];
  const data = readFields(asObject(body), errors, { requireTitle: false });

  if (errors.length === 0 && Object.keys(data).length === 0) {
    errors.push({
      field: 'body',
      message: 'Provide at least one of: title, description, status, priority, dueDate, tags',
    });
  }
  if (errors.length > 0) throw new AppError('Validation failed', 400, errors);
  return data;
};

// PATCH /:id/status: only status, and it is required
export const validateStatusUpdate = (body) => {
  const status = body?.status;
  if (!TASK_STATUSES.includes(status)) {
    throw new AppError('Validation failed', 400, [{ field: 'status', message: STATUS_MESSAGE }]);
  }
  return { status };
};

const readBool = (value, field, errors) => {
  if (value === undefined) return false;
  if (value !== 'true' && value !== 'false') {
    errors.push({ field, message: `${field} must be true or false` });
    return false;
  }
  return value === 'true';
};

export const validateListQuery = (query) => {
  const errors = [];
  const result = { page: 1, limit: 10, sortBy: 'createdAt', order: -1 };

  if (query.status !== undefined) {
    if (!TASK_STATUSES.includes(query.status)) errors.push({ field: 'status', message: STATUS_MESSAGE });
    else result.status = query.status;
  }

  if (query.page !== undefined) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) errors.push({ field: 'page', message: 'Page must be a positive integer' });
    else result.page = page;
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
    if (!['asc', 'desc'].includes(query.order)) errors.push({ field: 'order', message: 'Order must be asc or desc' });
    else result.order = query.order === 'asc' ? 1 : -1;
  }

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') errors.push({ field: 'search', message: 'Search must be a string' });
    else if (query.search.trim()) result.search = query.search.trim().slice(0, 100);
  }

  if (query.priority !== undefined) {
    const priority = Number(query.priority);
    if (!Number.isInteger(priority) || priority < 1 || priority > 4) {
      errors.push({ field: 'priority', message: 'Priority must be a whole number from 1 to 4' });
    } else {
      result.priority = priority;
    }
  }

  if (query.tag !== undefined) {
    const tag = typeof query.tag === 'string' ? query.tag.trim().replace(/^#/, '').toLowerCase() : '';
    if (typeof query.tag !== 'string' || tag.length > TAG_MAX || (tag && !TAG_RE.test(tag))) {
      errors.push({ field: 'tag', message: 'Tag is invalid' });
    } else if (tag) {
      result.tag = tag;
    }
  }

  for (const field of ['dueFrom', 'dueTo']) {
    if (query[field] !== undefined) {
      const date = parseDate(query[field]);
      if (!date) errors.push({ field, message: `${field} must be an ISO date string` });
      else result[field] = date;
    }
  }

  if (readBool(query.overdue, 'overdue', errors)) result.overdue = true;
  if (readBool(query.noDue, 'noDue', errors)) result.noDue = true;

  if (errors.length > 0) throw new AppError('Validation failed', 400, errors);
  return result;
};
