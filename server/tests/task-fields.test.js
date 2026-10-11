import { beforeEach, describe, expect, it } from 'vitest';
import { newUser } from './helpers.js';

const DAY = 24 * 60 * 60 * 1000;
const iso = (days) => new Date(Date.now() + days * DAY).toISOString();

let alice;
const create = (body) => alice.post('/api/v1/tasks').send(body);
const list = (query) => alice.get('/api/v1/tasks').query(query);
const titles = (res) => res.body.data.map((t) => t.title).sort();

beforeEach(async () => {
  alice = (await newUser('Alice')).agent;
});

describe('create with the new fields', () => {
  it('stores priority, due date and normalized tags', async () => {
    const res = await create({
      title: 'Call client',
      priority: 1,
      dueDate: iso(1),
      tags: ['#Work', 'work', ' Home '],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.priority).toBe(1);
    expect(res.body.data.tags).toEqual(['work', 'home']);
    expect(new Date(res.body.data.dueDate).getTime()).toBeGreaterThan(Date.now());
  });

  it('uses sensible defaults', async () => {
    const res = await create({ title: 'Plain' });
    expect(res.body.data).toMatchObject({ priority: 4, dueDate: null, tags: [] });
  });

  it.each([
    ['priority 9', { priority: 9 }],
    ['fractional priority', { priority: 2.5 }],
    ['string priority', { priority: '1' }],
    ['text due date', { dueDate: 'tomorrow' }],
    ['numeric due date', { dueDate: 12345 }],
    ['non-array tags', { tags: 'work' }],
    ['non-string tag', { tags: [1] }],
    ['tag with symbols', { tags: ['a b!'] }],
    ['too many tags', { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }],
  ])('rejects %s with 400', async (_name, extra) => {
    const res = await create({ title: 'x', ...extra });
    expect(res.status).toBe(400);
  });
});

describe('update', () => {
  it('changes fields and clears the due date with null', async () => {
    const id = (await create({ title: 'x', dueDate: iso(2), tags: ['a'] })).body.data.id;

    const res = await alice.patch(`/api/v1/tasks/${id}`).send({ dueDate: null, priority: 2, tags: ['b'] });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ dueDate: null, priority: 2, tags: ['b'] });
  });
});

describe('filters and sorting', () => {
  beforeEach(async () => {
    await create({ title: 'A', priority: 1, tags: ['work'], dueDate: iso(-1) });
    await create({ title: 'B', priority: 3, tags: ['home'], dueDate: iso(1) });
    await create({ title: 'C', tags: ['work'], status: 'done' });
    await create({ title: 'D', status: 'done', dueDate: iso(-2) });
  });

  it('filters by priority, including the default priority 4', async () => {
    expect(titles(await list({ priority: 1 }))).toEqual(['A']);
    expect(titles(await list({ priority: 4 }))).toEqual(['C', 'D']);
  });

  it('filters by tag, ignoring # and case', async () => {
    expect(titles(await list({ tag: '#Work' }))).toEqual(['A', 'C']);
  });

  it('overdue excludes finished tasks', async () => {
    expect(titles(await list({ overdue: 'true' }))).toEqual(['A']);
  });

  it('noDue returns tasks without a date', async () => {
    expect(titles(await list({ noDue: 'true' }))).toEqual(['C']);
  });

  it('filters by a due date range', async () => {
    expect(titles(await list({ dueFrom: iso(0), dueTo: iso(2) }))).toEqual(['B']);
  });

  it('sorts by priority', async () => {
    const res = await list({ sortBy: 'priority', order: 'asc', priority: 1 });
    expect(res.body.data[0].title).toBe('A');
  });

  it('rejects invalid filter values with 400', async () => {
    expect((await list({ priority: 7 })).status).toBe(400);
    expect((await list({ dueFrom: 'soon' })).status).toBe(400);
    expect((await list({ overdue: 'maybe' })).status).toBe(400);
  });
});
