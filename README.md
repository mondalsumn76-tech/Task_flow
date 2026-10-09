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
## System Architecture
graph TD
    %% Users and Interfaces
    User([Web User]) -->|Interacts with| Client[React Frontend]
    Dev([Power User / Dev]) -->|Runs commands| CLI[Node.js CLI]

    %% Core Application
    subgraph backend [Server Architecture]
        Server[Express REST API]
        Auth[Auth Middleware]
        Routes[API Routes]
        Controllers[Controllers]
        
        Server --> Auth
        Auth --> Routes
        Routes --> Controllers
    end

    %% Connections
    Client -->|HTTP Requests / JSON| Server
    CLI -->|HTTP Requests / JWT Auth| Server

    %% Data Layer
    subgraph data [Data Layer]
        DB[(Database)]
        Cache[(Redis Cache)]
    end

    Controllers -->|Read/Write| DB
    Controllers -->|Query/Store| Cache


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

Health check(with the server running locally): http://localhost:5000/api/health
