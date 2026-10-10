import app from './app.js';
import { env, assertEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const start = async () => {
  try {
    assertEnv();
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
