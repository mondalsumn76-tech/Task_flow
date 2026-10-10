import request from 'supertest';
import app from '../src/app.js';

let counter = 0;

// Returns a logged-in agent. The agent keeps the auth cookie between requests.
export const newUser = async (name = 'User') => {
  const agent = request.agent(app);
  const email = `${name.toLowerCase()}.${Date.now()}.${++counter}@example.com`;
  const res = await agent
    .post('/api/v1/auth/register')
    .send({ name, email, password: 'Password123' });

  if (res.status !== 201) {
    throw new Error(`newUser(${name}) failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { agent, email, res };
};
