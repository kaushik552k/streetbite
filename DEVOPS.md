# StreetBite — Developer Operations Guide

## Architecture Overview

| Service | Tech | Port | Command |
|---|---|---|---|
| **API** | Fastify + Prisma + PostgreSQL | `:4000` | `pnpm dev` in `apps/api` |
| **Owner Portal** | Vite + React + Tailwind v4 | `:5173` | `pnpm dev` in `apps/owner-portal` |
| **Admin Portal** | Vite + React + Tailwind v4 | `:5175` | `pnpm dev` in `apps/admin-portal` |
| **Mobile App** | Expo + React Native | `:8081` | `pnpm dev` in `apps/mobile` |
| **PostgreSQL** | Docker (postgis/postgis) | `:5432` | Docker |
| **Redis** | Docker (redis:7) | `:6379` | Docker |

---

## Starting Everything

### 1. Start Docker (Database + Redis)
```powershell
# From project root
docker compose up -d

# Verify containers are running
docker ps
```

### 2. Start the API
```powershell
cd apps/api
pnpm dev
# API runs at http://localhost:4000
# Health check: http://localhost:4000/health
```

### 3. Start the Owner Portal
```powershell
cd apps/owner-portal
pnpm dev
# Runs at http://localhost:5173
```

### 4. Start the Admin Portal
```powershell
cd apps/admin-portal
pnpm dev
# Runs at http://localhost:5175
```

### 5. Start the Mobile App
```powershell
cd apps/mobile
pnpm dev   # (--offline flag is pre-set to avoid Node.js fetch bug)
# Press 'w' to open in browser at http://localhost:8081
```

### Run All at Once (from monorepo root)
```powershell
pnpm dev
```

---

## Database Management

### Prisma CLI Commands
```powershell
# cd into apps/api first before running any prisma commands
cd apps/api

# Push schema changes to DB (no migration history)
pnpm db:push

# Create a migration (production-safe, tracked)
pnpm db:migrate

# Re-generate Prisma Client after schema changes
pnpm db:generate

# Open Prisma Studio (GUI to browse/edit database)
pnpm db:studio

# Seed the database with sample data
pnpm db:seed
```

### Direct Database Access (psql via Docker)
```powershell
# Connect to the database as psql
docker exec -it streetbite_db psql -U postgres -d streetbite

# Common psql commands inside the shell:
\dt              -- list all tables
\d "FoodTruck"   -- describe a table
SELECT * FROM "User";
SELECT * FROM "FoodTruck";
SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;
\q               -- quit
```

### Reset the Database (DANGER — wipes all data)
```powershell
cd apps/api
npx prisma migrate reset --force
pnpm db:seed    # Re-seed after reset
```

---

## Logs

### API Logs
The Fastify API uses Pino for structured JSON logging.

```powershell
# Pretty-print logs while running dev:
cd apps/api
pnpm dev       # pino-pretty is enabled automatically in dev

# Filter logs with grep (errors only):
cd apps/api
pnpm dev 2>&1 | Select-String "ERROR"
```

### Docker Container Logs
```powershell
# PostgreSQL logs
docker logs streetbite_db --tail 50 -f

# Redis logs
docker logs streetbite_redis --tail 50 -f
```

---

## Environment Variables

### `apps/api/.env`
| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API server port (default: 4000) |
| `DEV_BYPASS_TOKEN` | Set to `dev_bypass` in dev to skip Clerk auth |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `CLERK_SECRET_KEY` | From Clerk Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard → Developers |
| `CORS_ORIGINS` | Comma-separated allowed origins (used in prod) |

### `apps/mobile/.env`
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard |
| `EXPO_PUBLIC_API_URL` | Points to `http://localhost:4000` |
| `EXPO_OFFLINE` | Set to `1` to skip Expo version checks |

### `apps/owner-portal/.env` and `apps/admin-portal/.env`
| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard |
| `VITE_API_URL` | Points to `http://localhost:4000` |

---

## API Endpoints Reference

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/trucks` | List all approved trucks |
| `GET` | `/api/v1/trucks/:id` | Truck detail + menu |
| `GET` | `/api/v1/trucks/nearby?lat=&lng=&radius=` | Geo search (PostGIS) |
| `GET` | `/api/v1/trucks/:id/reviews` | Truck reviews |

### Authenticated (Customer)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/orders` | My orders |
| `POST` | `/api/v1/orders` | Place an order |
| `GET` | `/api/v1/orders/:id` | Order detail |

### Owner
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/trucks/owner/me` | My truck + full menu |
| `PATCH` | `/api/v1/trucks/:id` | Update truck info |
| `PATCH` | `/api/v1/trucks/:id/status` | Toggle open/closed |
| `POST` | `/api/v1/menu/items` | Add menu item |
| `PATCH` | `/api/v1/menu/items/:id` | Edit menu item |
| `DELETE` | `/api/v1/menu/items/:id` | Delete menu item |
| `PATCH` | `/api/v1/orders/:id/status` | Advance order status |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/trucks` | All trucks |
| `GET` | `/api/v1/admin/trucks/pending` | Awaiting approval |
| `PATCH` | `/api/v1/admin/trucks/:id/approve` | Approve/reject truck |
| `GET` | `/api/v1/admin/users` | All users |
| `GET` | `/api/v1/admin/analytics` | Platform metrics |

---

## Real-Time Events (Socket.IO)

The API emits Socket.IO events on port `4000`.

| Event | Direction | Payload |
|---|---|---|
| `order:new` | Server → Owner | Full new order object |
| `order:status` | Server → Customer + Owner | `{ status, estimatedMins }` |
| `truck:status` | Server → Customers | `{ isActive }` |

### Connecting to Socket.IO (Frontend)
```ts
import { io } from 'socket.io-client'
const socket = io('http://localhost:4000')
socket.on('order:new', (order) => console.log('New order!', order))
```

---

## Dev Auth Bypass

All 3 frontends are set to `DEV_MODE = true` to bypass Clerk authentication.
Every API call sends `Authorization: Bearer dev_bypass`.
The API auto-authenticates this as the seeded Customer user.

> **IMPORTANT:** Remove all `DEV_MODE = true` flags and `DEV_BYPASS_TOKEN` from `.env`
> before deploying to production.

---

## Useful Docker Commands

```powershell
# Start all containers
docker compose up -d

# Stop all containers
docker compose down

# Stop and delete volumes (wipes DB data!)
docker compose down -v

# Restart a single container
docker restart streetbite_db

# Check container health
docker inspect streetbite_db --format='{{.State.Health.Status}}'
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `401 Unauthorized` from API | Ensure `DEV_BYPASS_TOKEN=dev_bypass` is in `apps/api/.env` and API has restarted |
| `CORS error` in browser | Check `apps/api/src/index.ts` — `origin: true` should be set |
| `TypeError: Body is unusable` in Expo | Already fixed — `--offline` flag is in `package.json` scripts |
| Prisma error: table not found | Run `pnpm db:push` in `apps/api` |
| Port already in use | Run `netstat -ano \| findstr :4000` to find the PID, then `taskkill /PID <pid> /F` |
| Mobile app not loading | Press `r` in the Expo terminal to reload, or clear cache with `--clear` flag |
