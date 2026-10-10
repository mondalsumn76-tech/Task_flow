import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ success: false, message }),
  });

// Every /api/v1 request
export const apiLimiter = createLimiter(
  env.isProduction ? 300 : 1000,
  'Too many requests, please try again later'
);

// Login and register: stops password guessing
export const authLimiter = createLimiter(
  env.isProduction ? 10 : 30,
  'Too many attempts, please try again in 15 minutes'
);
