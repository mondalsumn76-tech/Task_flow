const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// credentials: 'include' makes the browser send the HTTP-only auth cookie
async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }

  if (res.status === 204) return null;

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // non-JSON response, handled below
  }

  if (!res.ok) {
    const details = payload?.details;
    const message = details?.length
      ? details.map((d) => d.message).join('. ')
      : payload?.message || 'Something went wrong';
    throw new ApiError(message, res.status, details);
  }
  return payload;
}

export const authService = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

export const taskService = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },
  stats: () => request("/tasks/stats"),
  get: (id) => request(`/tasks/${id}`),
  create: (data) => request('/tasks', { method: 'POST', body: data }),
  update: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: data }),
  setStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
