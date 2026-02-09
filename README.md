# Westcliff Student Services Assistant

Web-603-Project: AI-powered Student Services Portal for Westcliff University.

A single-page application that uses a guided AI intake flow to convert student issues into structured support tickets. Staff manage tickets via a Kanban dashboard.

## Tech Stack

- **Frontend** — React + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend** — Express + TypeScript, MongoDB (Mongoose)
- **AI Service** — Python, FastAPI
- **Auth** — Google OAuth 2.0
- **Infrastructure** — Docker Compose

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Git

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd westcliff-assistant

# Create your env file
cp .env.example .env

# Start all services
docker compose up --build
```

Once running:

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:8080         |
| Backend  | http://localhost:3001/health  |
| AI Docs  | http://localhost:8001/docs    |
| MongoDB  | localhost:27017              |

## Useful Commands

```bash
# Start specific services
docker compose up --build frontend
docker compose up --build backend mongo
docker compose up --build ai

# Stop all services
docker compose down

# Stop and wipe MongoDB data
docker compose down -v
```

## Project Structure

```
westcliff-assistant/
├── frontend/       # React SPA (Vite, Tailwind, shadcn/ui)
├── backend/        # Express API (TypeScript, Mongoose)
├── ai/             # FastAPI microservice (Python)
└── docker-compose.yml
```

