import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, afterEach, inject } from 'vitest';

// Each test file runs in its own worker, so each gets its own database.
// Otherwise one file's cleanup would delete another file's users mid-test.
const base = inject('mongoUri').replace(/\/[^/]*$/, '');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.MONGODB_URI = `${base}/test_${randomUUID().slice(0, 8)}`;

await mongoose.connect(process.env.MONGODB_URI);

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
