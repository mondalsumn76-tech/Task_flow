const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// "Today" is the user's local day, so the client computes the range
// and the server just runs a plain date query.
export function dueFilterParams(kind) {
  const start = startOfToday();
  switch (kind) {
    case 'overdue':
      return { overdue: true };
    case 'today':
      return { dueFrom: start.toISOString(), dueTo: addDays(start, 1).toISOString() };
    case 'week':
      return { dueFrom: start.toISOString(), dueTo: addDays(start, 7).toISOString() };
    case 'none':
      return { noDue: true };
    default:
      return {};
  }
}
