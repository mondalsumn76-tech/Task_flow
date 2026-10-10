import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { newUser } from './helpers.js';

let alice;
let bob;

beforeEach(async () => {
  alice = (await newUser('Alice')).agent;
  bob = (await newUser('Bob')).agent;
});

const create = (agent, body) => agent.post('/api/v1/tasks').send(body);

describe('authentication', () => {
  it('rejects every task route without a session', async () => {
    expect((await request(app).get('/api/v1/tasks')).status).toBe(401);
    expect((await request(app).post('/api/v1/tasks').send({ title: 'x' })).status).toBe(401);
    expect((await request(app).get('/api/v1/tasks/stats')).status).toBe(401);
  });
});

describe('create', () => {
  it('creates a task with the default status and hides the owner', async () => {
    const res = await create(alice, { title: '  Learn Node  ' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Learn Node');
    expect(res.body.data.status).toBe('todo');
    expect(res.body.data.user).toBeUndefined();
  });

  it('rejects a missing title and a bad status with 400', async () => {
    expect((await create(alice, { description: 'no title' })).status).toBe(400);
    expect((await create(alice, { title: 'x', status: 'finished' })).status).toBe(400);
  });

  it('ignores a client-supplied user id', async () => {
    const res = await create(alice, { title: 'Mine', user: 'aaaaaaaaaaaaaaaaaaaaaaaa' });
    expect(res.status).toBe(201);
    const bobList = await bob.get('/api/v1/tasks');
    expect(bobList.body.meta.total).toBe(0);
    const aliceList = await alice.get('/api/v1/tasks');
    expect(aliceList.body.meta.total).toBe(1);
  });
});

describe('ownership: User A cannot touch User B tasks', () => {
  let taskId;

  beforeEach(async () => {
    taskId = (await create(alice, { title: 'Alice private' })).body.data.id;
  });

  it("Bob cannot read, edit, change status of, or delete Alice's task", async () => {
    expect((await bob.get(`/api/v1/tasks/${taskId}`)).status).toBe(404);
    expect((await bob.patch(`/api/v1/tasks/${taskId}`).send({ title: 'hacked' })).status).toBe(404);
    expect((await bob.patch(`/api/v1/tasks/${taskId}/status`).send({ status: 'done' })).status).toBe(404);
    expect((await bob.delete(`/api/v1/tasks/${taskId}`)).status).toBe(404);
  });

  it("Alice's task is unchanged after Bob's attempts", async () => {
    await bob.patch(`/api/v1/tasks/${taskId}`).send({ title: 'hacked' });
    await bob.delete(`/api/v1/tasks/${taskId}`);
    const res = await alice.get(`/api/v1/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Alice private');
  });

  it("Bob's list and stats do not include Alice's task", async () => {
    expect((await bob.get('/api/v1/tasks')).body.meta.total).toBe(0);
    expect((await bob.get('/api/v1/tasks/stats')).body.data.total).toBe(0);
  });
});

describe('read, update, delete', () => {
  it('gets, updates, changes status of, and deletes a task', async () => {
    const id = (await create(alice, { title: 'Cycle' })).body.data.id;

    expect((await alice.get(`/api/v1/tasks/${id}`)).status).toBe(200);

    const upd = await alice.patch(`/api/v1/tasks/${id}`).send({ description: 'updated' });
    expect(upd.status).toBe(200);
    expect(upd.body.data.description).toBe('updated');

    const st = await alice.patch(`/api/v1/tasks/${id}/status`).send({ status: 'done' });
    expect(st.body.data.status).toBe('done');

    expect((await alice.delete(`/api/v1/tasks/${id}`)).status).toBe(204);
    expect((await alice.get(`/api/v1/tasks/${id}`)).status).toBe(404);
  });

  it('returns 400 for a malformed id and 404 for a valid but unknown id', async () => {
    expect((await alice.get('/api/v1/tasks/abc')).status).toBe(400);
    expect((await alice.get('/api/v1/tasks/aaaaaaaaaaaaaaaaaaaaaaaa')).status).toBe(404);
  });

  it('rejects an empty PATCH body with 400', async () => {
    const id = (await create(alice, { title: 'x' })).body.data.id;
    expect((await alice.patch(`/api/v1/tasks/${id}`).send({})).status).toBe(400);
  });
});

describe('list: filter, search, pagination, stats', () => {
  beforeEach(async () => {
    await create(alice, { title: 'Learn Node', status: 'todo' });
    await create(alice, { title: 'Build REST API', status: 'in-progress' });
    await create(alice, { title: 'Deploy project', status: 'done' });
  });

  it('filters by status', async () => {
    const res = await alice.get('/api/v1/tasks').query({ status: 'done' });
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Deploy project');
  });

  it('paginates and reports meta', async () => {
    const res = await alice.get('/api/v1/tasks').query({ page: 1, limit: 2 });
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ total: 3, totalPages: 2, page: 1, limit: 2 });
  });

  it('searches case-insensitively', async () => {
    const res = await alice.get('/api/v1/tasks').query({ search: 'api' });
    expect(res.body.data).toHaveLength(1);
  });

  it('treats regex characters in search as plain text', async () => {
    const res = await alice.get('/api/v1/tasks').query({ search: '(.*)*' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('rejects invalid query values with 400', async () => {
    expect((await alice.get('/api/v1/tasks').query({ status: 'finished' })).status).toBe(400);
    expect((await alice.get('/api/v1/tasks').query({ limit: 1000 })).status).toBe(400);
  });

  it('returns correct stats', async () => {
    const res = await alice.get('/api/v1/tasks/stats');
    expect(res.body.data).toEqual({ total: 3, todo: 1, inProgress: 1, done: 1 });
  });
});
