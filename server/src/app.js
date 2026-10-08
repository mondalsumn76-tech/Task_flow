import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

const app = express();

// Middleware
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running!!',
  });
});

export default app;