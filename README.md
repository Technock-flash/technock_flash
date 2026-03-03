# ZimMarket

Multi-vendor marketplace with React frontend and Node.js backend.

## Prerequisites

- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop) — must be installed and running
- Node.js 18+

## Quick start with Docker

### 1. Start Redis and PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts Redis (port 6379) and PostgreSQL (port 5432).

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: set JWT secrets, and add:
# USE_IN_MEMORY_CACHE=false
# (so the server uses Redis instead of in-memory cache)
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend setup

In a new terminal:

```bash
cd client
npm install
npm run dev
```

### 4. Open the app

- Frontend: http://localhost:5173  
- Backend: http://localhost:4000  

## Without Docker

If you don't use Docker, the backend uses in-memory caching by default (no Redis required). Ensure PostgreSQL is running and configured in `.env`.
# technock_flash
