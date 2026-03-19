# ZimMarket

Multi-vendor marketplace with React frontend and Node.js backend.

## Project Overview

ZimMarket is a modern multi-vendor e-commerce platform designed for scalability and ease of management. It features a robust role-based access control system and a streamlined moderation workflow.

### Tech Stack

-   **Frontend:** React (TypeScript), Redux Toolkit (State Management), React Router (Lazy Loading).
-   **Backend:** Node.js, Prisma ORM (PostgreSQL).
-   **Infrastructure:** Redis (Caching & Session Management), Docker.

### Key Features

-   **Role-Based Access Control:**
    -   **Customers:** Browse products, manage wishlists, and place orders.
    -   **Vendors:** Manage product listings and track store performance via a dedicated dashboard.
    -   **Admins:** Oversee the platform, moderate products/vendors, handle refunds, and manage CMS content.
-   **Product Moderation:** A gatekeeper workflow where admin approval is required for vendor products to go live.
-   **Robust Security:** JWT-based authentication with refresh token rotation and HTTP-only cookies.
-   **CMS & Categories:** Dynamic management of site categories and static content pages.

### Architecture & Patterns

-   **Centralized Routing:** Located in `src/routes/index.tsx`, using `lazy` loading for performance optimization.
-   **Reusable Logic:** Standardized CRUD operations across admin and vendor panels using custom hooks like `useEntityManagement`.
-   **State Hydration:** Automatic authentication state recovery on page reload.
-   **Optimistic UI:** UI updates are performed optimistically during deletions to ensure a snappy user experience.

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
npm install && npm install winston
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
