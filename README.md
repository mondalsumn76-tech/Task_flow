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
- [ ] Day 6: Read, update, delete tasks

## Running the server

    cd server
    npm install
    cp .env.example .env
    # fill in MONGODB_URI and JWT_SECRET in .env
    npm run dev

Health check (server must be running locally): `http://localhost:5000/api/health`

Example response:

    {"success":true,"message":"TaskFlow API is running","database":"connected"}
