import * as chrono from 'chrono-node';

const TAG_RE = /(^|\s)#([\p{L}\p{N}_-]{1,30})(?=\s|$)/gu;
const PRIORITY_RE = /(^|\s)p([1-4])(?=\s|$)/i;
const TRAILING_WORDS = /\s+(at|on|by|due|before|until|in|for)$/i;
const MAX_TAGS = 10;
const MAX_TITLE = 120;

// Turns "Call client tomorrow at 3pm #work p1" into structured fields.
// Pure function: pass `ref` to make tests deterministic.
export function parseQuickAdd(input, ref = new Date(), { parseDate = true } = {}) {
  let text = input;

  const tags = [];
  text = text.replace(TAG_RE, (_, lead, tag) => {
    const lower = tag.toLowerCase();
    if (!tags.includes(lower) && tags.length < MAX_TAGS) tags.push(lower);
    return lead;
  });

  let priority = null;
  const match = text.match(PRIORITY_RE);
  if (match) {
    priority = Number(match[2]);
    text = text.replace(PRIORITY_RE, '$1');
  }

  let dueDate = null;
  let dateText = null;
  if (parseDate) {
    const [found] = chrono.parse(text, ref, { forwardDate: true });
    if (found) {
      const date = found.start.date();
      // No time typed: use local midnight, like the date picker does
      if (!found.start.isCertain('hour')) date.setHours(0, 0, 0, 0);
      dueDate = date.toISOString();
      dateText = found.text;
      text = `${text.slice(0, found.index)} ${text.slice(found.index + found.text.length)}`;
    }
  }

  const title = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(TRAILING_WORDS, '')
    .trim()
    .slice(0, MAX_TITLE);

  return { title, priority, dueDate, dateText, tags };
}
