# Admin Dashboard — Enterprise Architecture

## Backend API Structure

### Base path
All admin endpoints require authentication and `ADMIN` role: `GET/POST/PATCH/DELETE /api/admin/*`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Aggregate counts: users, vendors, orders |
| GET | `/analytics` | Sales analytics (revenue, conversion, AOV). Query: `?period=day\|week\|month` |
| GET | `/vendors` | Paginated vendor list. Query: `?status=PENDING\|APPROVED\|REJECTED&page=&limit=` |
| POST | `/vendors/:id/approve` | Approve vendor |
| POST | `/vendors/:id/reject` | Reject vendor |
| GET | `/products/moderation` | Paginated products for moderation. Query: `?status=&page=&limit=` |
| POST | `/products/:id/approve` | Approve product |
| POST | `/products/:id/reject` | Reject product |
| GET | `/users` | Paginated user list. Query: `?page=&limit=` |
| PATCH | `/users/:id/role` | Update user role. Body: `{ "role": "CUSTOMER"\|"VENDOR"\|"ADMIN" }` |
| GET | `/refunds` | Paginated refund list. Query: `?status=&page=&limit=` |
| POST | `/refunds/:id/approve` | Approve refund |
| POST | `/refunds/:id/reject` | Reject refund |
| GET | `/cms` | List all CMS pages |
| GET | `/cms/:slug` | Get CMS page by slug |
| POST | `/cms` | Create CMS page. Body: `{ slug, title, content }` |
| PATCH | `/cms/:slug` | Update CMS page. Body: `{ title?, content?, isPublished? }` |
| DELETE | `/cms/:slug` | Delete CMS page |
| GET | `/activity-logs` | Paginated activity logs. Query: `?entity=&page=&limit=` |

---

## Database Queries (Optimized)

### Indexes (Prisma schema)
- `Vendor`: `@@index([status])`
- `Product`: `@@index([moderationStatus])`
- `Refund`: `@@index([status])`
- `Order`: `@@index([createdAt])`, `@@index([status])`
- `ActivityLog`: `@@index([createdAt])`, `@@index([entity, entityId])`, `@@index([userId])`

### Analytics query
- **Revenue**: Orders with `status != CANCELLED` and `payments.some(status: COMPLETED)`
- **Aggregation**: Client-side grouping by day/week/month to avoid raw SQL
- **Conversion**: `(completed orders) / (total orders)` in period

### Pagination
- All list endpoints use `skip`/`take` with `limit` cap (50 or 100)
- Use `Promise.all([findMany, count])` for total and items in one round-trip

---

## Frontend Dashboard Layout

### Structure
```
/admin
  /           — Dashboard (stats, revenue chart, metrics)
  /vendors    — Vendor approval workflow
  /orders     — Order overview (placeholder)
  /products   — Product moderation
  /users      — User management (role change)
  /refunds    — Refund handling
  /cms        — CMS content list
  /activity   — System activity logs
```

### Chart integration (Recharts)
- **Library**: `recharts`
- **Component**: `RevenueChart` — `AreaChart` with `ResponsiveContainer`
- **Data**: `revenueByPeriod` from `/admin/analytics?period=day|week|month`
- **Format**: X = date, Y = revenue (formatted via `formatPrice`)

---

## Performance Optimization

### Backend
1. **Indexes**: All filter/sort columns indexed (status, createdAt, entity)
2. **Pagination**: Limit 20–50 per page; avoid loading full tables
3. **Parallel queries**: `Promise.all` for stats and list+count
4. **Analytics caching** (future): Redis cache for `/analytics` with 5–15 min TTL

### Frontend
1. **Lazy loading**: Admin routes loaded via `React.lazy()`
2. **Memoization**: `RevenueChart` wrapped in `memo`
3. **Period switching**: Fetch analytics only when period changes

### Future enhancements
- Redis cache for analytics aggregation
- Server-side filtering for activity logs (by entity type)
- Virtual scrolling for large tables
