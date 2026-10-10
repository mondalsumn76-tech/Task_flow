import { env } from '../config/env.js';

// Express recognizes an error handler by its 4 parameters. Keep all four.
// This function never sends err.stack to the client.
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    // Duplicate key from a unique index (for example, an email already registered)
    statusCode = 409;
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
    message = `${field} already in use`;
  }

  if (statusCode >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
