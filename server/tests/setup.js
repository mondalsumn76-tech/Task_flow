import mongoose from 'mongoose';
import { afterAll, afterEach, inject } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.MONGODB_URI = inject('mongoUri');

await mongoose.connect(process.env.MONGODB_URI);

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
