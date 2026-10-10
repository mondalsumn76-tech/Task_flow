import { AppError } from '../utils/AppError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 50;
const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt ignores anything beyond 72 bytes

const asObject = (body) => {
  const input = body ?? {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('Request body must be a JSON object', 400);
  }
  return input;
};

// Requiring a string here is what blocks NoSQL operator injection like {"$gt": ""}
const readEmail = (value, errors) => {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
    return undefined;
  }
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'Email is invalid' });
    return undefined;
  }
  return email;
};

export const validateRegister = (body) => {
  const input = asObject(body);
  const errors = [];

  let name;
  if (typeof input.name !== 'string' || !input.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (input.name.trim().length > NAME_MAX) {
    errors.push({ field: 'name', message: `Name cannot exceed ${NAME_MAX} characters` });
  } else {
    name = input.name.trim();
  }

  const email = readEmail(input.email, errors);

  let password;
  if (typeof input.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (input.password.length < PASSWORD_MIN) {
    errors.push({ field: 'password', message: `Password must be at least ${PASSWORD_MIN} characters` });
  } else if (Buffer.byteLength(input.password) > PASSWORD_MAX_BYTES) {
    errors.push({ field: 'password', message: `Password cannot exceed ${PASSWORD_MAX_BYTES} bytes` });
  } else {
    password = input.password;
  }

  if (errors.length > 0) throw new AppError('Validation failed', 400, errors);
  return { name, email, password };
};

export const validateLogin = (body) => {
  const input = asObject(body);
  const errors = [];

  const email = readEmail(input.email, errors);

  if (typeof input.password !== 'string' || !input.password || input.password.length > 128) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) throw new AppError('Validation failed', 400, errors);
  return { email, password: input.password };
};
