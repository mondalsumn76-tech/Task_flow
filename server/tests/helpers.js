import request from 'supertest';
import app from '../src/app.js';

// Returns a logged-in agent. The agent keeps the auth cookie between requests.
export const newUser = async (name = 'User') => {
  const agent = request.agent(app);
  const email = `${name.toLowerCase()}${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
  const res = await agent
    .post('/api/v1/auth/register')
    .send({ name, email, password: 'Password123' });
  return { agent, email, res };
};
