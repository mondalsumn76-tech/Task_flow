import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from './parseQuickAdd.js';

const REF = new Date(2026, 9, 12, 10, 0, 0); // Monday 12 Oct 2026, 10:00 local

const local = (iso) => {
  const d = new Date(iso);
  return [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()];
};

describe('parseQuickAdd', () => {
  it('parses title, date, time, tag and priority together', () => {
    const r = parseQuickAdd('Call client tomorrow at 3 pm #work p1', REF);
    expect(r.title).toBe('Call client');
    expect(r.priority).toBe(1);
    expect(r.tags).toEqual(['work']);
    expect(local(r.dueDate)).toEqual([2026, 9, 13, 15, 0]);
  });

  it('uses local midnight when only a date is given', () => {
    const r = parseQuickAdd('Submit report tomorrow', REF);
    expect(local(r.dueDate)).toEqual([2026, 9, 13, 0, 0]);
    expect(r.title).toBe('Submit report');
  });

  it('removes a dangling preposition from the title', () => {
    const r = parseQuickAdd('Pay rent on friday', REF);
    expect(r.title).toBe('Pay rent');
    expect(local(r.dueDate)).toEqual([2026, 9, 16, 0, 0]);
  });

  it('leaves plain text alone', () => {
    const r = parseQuickAdd('Buy milk', REF);
    expect(r).toMatchObject({ title: 'Buy milk', priority: null, dueDate: null, tags: [] });
  });

  it('normalizes and de-duplicates tags', () => {
    const r = parseQuickAdd('Plan trip #Travel #travel #home-2', REF);
    expect(r.tags).toEqual(['travel', 'home-2']);
    expect(r.title).toBe('Plan trip');
  });

  it('only treats p1 to p4 as priority when standalone', () => {
    expect(parseQuickAdd('Fix bug p5', REF).priority).toBeNull();
    expect(parseQuickAdd('Fix bug p5', REF).title).toBe('Fix bug p5');
    expect(parseQuickAdd('Fix bug p3', REF).priority).toBe(3);
    expect(parseQuickAdd('Read ap2 notes', REF).priority).toBeNull();
  });

  it('can ignore date parsing', () => {
    const r = parseQuickAdd('Dinner tomorrow', REF, { parseDate: false });
    expect(r.dueDate).toBeNull();
    expect(r.title).toBe('Dinner tomorrow');
  });

  it('caps the title at 120 characters', () => {
    expect(parseQuickAdd('x'.repeat(200), REF).title).toHaveLength(120);
  });

  it('returns an empty title when only metadata is typed', () => {
    expect(parseQuickAdd('#work p1', REF).title).toBe('');
  });
});
