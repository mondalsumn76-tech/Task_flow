import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getDatabaseStatus } from './config/database.js';
import taskRoutes from './routes/task.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  const database = getDatabaseStatus();
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: 'TaskFlow API is running',
    database,
  });
});

app.use('/api/v1/tasks', taskRoutes);

// Must come AFTER all routes
app.use(notFound);
app.use(errorHandler);

export default app;
