import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getDatabaseStatus } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Behind Render's proxy, trust one hop so rate limiting sees real client IPs
if (env.isProduction) app.set('trust proxy', 1);

// Security and logging first
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
if (env.nodeEnv !== 'test') app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Parsers (body size capped; JSON-only parsing also blocks cross-site form posts)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Health check stays outside the rate limiter so platform probes never get blocked
app.get('/api/health', (req, res) => {
  const database = getDatabaseStatus();
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: 'TaskFlow API is running',
    database,
  });
});

// API
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Must come AFTER all routes
app.use(notFound);
app.use(errorHandler);

export default app;
