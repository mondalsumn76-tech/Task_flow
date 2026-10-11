# TaskFlow

A full-stack task management application built with the MERN stack.

## Planned Interfaces

- **Web app:** React + Vite + Tailwind CSS
- **REST API:** Node.js + Express
- **CLI:** Node.js command-line interface
- **Database:** MongoDB

## Project Structure

    taskflow/
    ├── client/   # React frontend
    ├── server/   # Express REST API
    ├── cli/      # Node.js CLI
    └── docs/     # Documentation

## Status

🚧 Under active development, built day by day.

## Roadmap

- [x] Day 1: Repository foundation
- [x] Day 2: Express backend foundation
- [x] Day 3: MongoDB Atlas connection
- [x] Day 4: Task model
- [x] Day 5: Create task API
- [x] Day 6: Read, update, delete tasks
- [x] Day 7: Authentication and security
- [x] Day 8a: Client auth (Vite, Tailwind, AuthContext)
- [x] Day 8b: Dashboard and task UI
- [x] Day 8c: Polish (dark mode, toasts, shortcuts, stats endpoint)
- [x] Day 9: Automated tests and CI
- [x] Day 10: Deployment (Render + Vercel + Atlas)

## Running the server

    cd server
    npm install
    cp .env.example .env
    # fill in MONGODB_URI and JWT_SECRET in .env
    npm run dev

Health check (server must be running locally): `http://localhost:5000/api/health`

## API (v1)

All task routes are scoped to the owner.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/tasks` | Create a task |
| GET | `/api/v1/tasks` | List tasks (`status`, `search`, `sortBy`, `order`, `page`, `limit`) |
| GET | `/api/v1/tasks/:id` | Get one task |
| PATCH | `/api/v1/tasks/:id` | Update title, description, or status |
| PATCH | `/api/v1/tasks/:id/status` | Update status only |
| DELETE | `/api/v1/tasks/:id` | Delete a task |

Example: `GET /api/v1/tasks?status=done&page=1&limit=10`

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create an account and start a session |
| POST | `/api/v1/auth/login` | Log in |
| POST | `/api/v1/auth/logout` | Clear the session cookie |
| GET | `/api/v1/auth/me` | Current user (requires login) |

All `/api/v1/tasks` routes require a session. Each user only ever sees their own tasks.

## Security

- Passwords hashed with bcrypt (cost 12), never stored or returned in plaintext
- JWT in an HTTP-only, SameSite cookie (Secure in production)
- Helmet security headers, CORS restricted to the client origin
- Rate limiting, with a stricter limit on login and register
- Strict input validation (whitelisting, type checks, 10 KB body limit)
- Centralized error handling: no stack traces or internals in responses
- The server refuses to start without a strong `JWT_SECRET`

## Running the client

    cd client
    npm install
    npm run dev

Open http://localhost:5173. In development, Vite proxies `/api` to the Express server on port 5000, so run both.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `n` | New task |
| `/` | Focus search |
| `Esc` | Close dialog |

## Testing

    cd server && npm test     # API tests (in-memory MongoDB, no setup needed)
    cd client && npm test     # component and hook tests

Tests run automatically on every push and pull request via GitHub Actions.

## Live demo

- App: https://task-flow-three-khaki.vercel.app/
- API health: https://taskflow-api-sxgn.onrender.com/api/health

The free-tier API sleeps when idle, so the first request can take up to a minute.

## Deployment

- **API:** Render (root `server`, `npm ci` / `npm start`), env: `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `TRUST_PROXY_HOPS=2`
- **Client:** Vercel (root `client`), with `vercel.json` rewriting `/api/*` to the API so the auth cookie stays first-party
- **Database:** MongoDB Atlas (`taskflow_prod`, with a user limited to that database)
