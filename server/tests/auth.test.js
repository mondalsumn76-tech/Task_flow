import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { newUser } from './helpers.js';

const valid = { name: 'Alice', email: 'alice@example.com', password: 'Password123' };
const register = (body) => request(app).post('/api/v1/auth/register').send(body);
const login = (body) => request(app).post('/api/v1/auth/login').send(body);

describe('POST /api/v1/auth/register', () => {
  it('creates a user, sets an HttpOnly cookie, never returns the password', async () => {
    const res = await register(valid);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(valid.email);
    expect(JSON.stringify(res.body)).not.toContain('password');

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('stores a bcrypt hash, not the plaintext password', async () => {
    await register(valid);
    const user = await User.findOne({ email: valid.email }).select('+password');
    expect(user.password).not.toBe(valid.password);
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  it('rejects a duplicate email with 409', async () => {
    await User.init(); // makes sure the unique index exists
    await register(valid);
    const res = await register(valid);
    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const res = await register({ ...valid, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('password');
  });

  it('rejects an invalid email with 400', async () => {
    const res = await register({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects a non-string email (operator injection) with 400', async () => {
    const res = await register({ ...valid, email: { $gt: '' } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await register(valid);
  });

  it('logs in with correct credentials and sets a cookie', async () => {
    const res = await login({ email: valid.email, password: valid.password });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  it('rejects a wrong password with 401', async () => {
    const res = await login({ email: valid.email, password: 'WrongPass999' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('gives the same message for an unknown email', async () => {
    const res = await login({ email: 'nobody@example.com', password: 'WrongPass999' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('rejects operator injection with 400', async () => {
    const res = await login({ email: { $gt: '' }, password: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('session: me and logout', () => {
  it('rejects /me without a cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', 'token=abc');
    expect(res.status).toBe(401);
  });

  it('returns the current user while logged in', async () => {
    const { agent, email } = await newUser('Carol');
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });

  it('ends the session on logout', async () => {
    const { agent } = await newUser('Dave');
    await agent.post('/api/v1/auth/logout');
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('stops accepting a token once the user is deleted', async () => {
    const { agent, email } = await newUser('Erin');
    await User.deleteOne({ email });
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
