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
- [ ] Day 3: MongoDB connection and Task model

## Running the server

    cd server
    npm install
    cp .env.example .env
    npm run dev

Health check: http://localhost:5000/api/health