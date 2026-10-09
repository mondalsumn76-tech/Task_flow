import mongoose from 'mongoose';
import { env } from './env.js';

const STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected to database "${mongoose.connection.name}"`);
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

export const getDatabaseStatus = () => STATES[mongoose.connection.readyState] ?? 'unknown';
