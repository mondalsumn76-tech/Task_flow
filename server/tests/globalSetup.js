import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export async function setup({ provide }) {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  provide('mongoUri', mongo.getUri());
}

export async function teardown() {
  await mongo?.stop();
}
