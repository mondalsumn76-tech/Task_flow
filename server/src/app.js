import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getDatabaseStatus } from './config/database.js';

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

export default app;
