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
- [ ] Day 8: Frontend setup

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
