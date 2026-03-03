# ZimMarket Frontend

Production-ready React + TypeScript marketplace UI.

## Setup

```bash
cd client
npm install
```

## Environment

Copy `.env.example` to `.env` and adjust `VITE_API_URL` if your backend runs on a different port.

## Development

```bash
npm run dev
```

Runs the app at http://localhost:5173. API requests are proxied to the backend (default http://localhost:4000).

## Build

```bash
npm run build
```

## Architecture

- **State**: Redux Toolkit (auth, cart, wishlist)
- **Auth**: Cookie-based refresh token, in-memory access token, hydration on load
- **API**: Axios with interceptors, automatic token refresh
- **Routing**: React Router v6 with lazy-loaded routes and role-based protection
- **Features**: Products, cart, checkout, orders, vendor dashboard, admin dashboard
