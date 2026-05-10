# StreetBite — System Design (HLD)

## 1. Executive Summary

StreetBite is a multi-tenant food truck discovery and ordering platform with four applications in a single Turborepo monorepo:

| App | Users | Purpose |
|---|---|---|
| Mobile App | Customers | Discover trucks, browse menus, place & track orders |
| Owner Portal | Truck Owners | Manage menu, live orders (Kanban), analytics |
| Admin Portal | Platform Admins | Approve trucks, manage users, platform analytics |
| Fastify API | All (internal) | Single backend serving all three frontends |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  📱 Mobile App          🏪 Owner Portal      🛡️ Admin Portal    │
│  Expo / React Native    Vite + React          Vite + React      │
│  :8081                  :5173                 :5175             │
└───────────────┬─────────────────┬──────────────────┬───────────┘
                │  REST + WS      │  REST + WS       │  REST
                ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTIFY API  :4000                         │
│                                                                 │
│  Auth Middleware (Clerk JWT / Dev Bypass)                       │
│  REST Routes  /api/v1/*          Rate Limit  100/min            │
│  Socket.IO Server  ws://          Helmet  Security headers      │
└──────────┬──────────────┬──────────────────┬───────────────────┘
           │              │                  │
           ▼              ▼                  ▼
    ┌──────────┐   ┌─────────────┐   ┌────────────┐
    │PostgreSQL│   │    Redis    │   │  External  │
    │+ PostGIS │   │    :6379    │   │  Services  │
    │  :5432   │   │  Cache/RL  │   │ Clerk/Stripe│
    └──────────┘   └─────────────┘   └────────────┘
```

---

## 3. Component Responsibilities

### Mobile App (Customer)
- Discover nearby food trucks via geolocation → `/trucks/nearby` (PostGIS)
- Browse truck detail page with categorized menu
- Cart management (local state), apply offer codes
- Checkout via Stripe PaymentIntent flow
- Real-time order tracking via Socket.IO `order:status` events
- Order history list

### Owner Portal (Truck Owner)
- Kanban board: PENDING → PREPARING → READY (triggers Socket.IO push to customer)
- Full menu CRUD: categories, items, availability toggles
- Dashboard analytics: revenue, orders, customers
- Truck settings: description, location, weekly schedule

### Admin Portal (Platform Admin)
- Platform analytics: total GMV, trucks, orders, users
- Approve/reject new food truck registrations
- Search and view all users by role
- Set per-truck commission rates

### Fastify API
- Role-based access control: CUSTOMER / OWNER / ADMIN per route
- Emits Socket.IO events on order create and status change
- Zod schema validation on all request bodies
- Stripe webhook handler for payment confirmation
- Clerk webhook handler for user sync

---

## 4. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Monorepo | Turborepo + pnpm | Shared types, parallel builds |
| Mobile | Expo SDK 54 + React Native | iOS/Android/Web from one codebase |
| Web Portals | Vite + React 19 + TypeScript | Fast HMR, modern React |
| Styling | Tailwind v4 (portals) / StyleSheet (mobile) | Design system tokens |
| API | Fastify v5 + TypeScript | 2× faster than Express, built-in schema |
| ORM | Prisma 5 | Type-safe queries, migration management |
| Database | PostgreSQL 16 + PostGIS | Relational + geographic radius queries |
| Cache | Redis 7 | Rate limit store, future session cache |
| Real-Time | Socket.IO 4 | Bidirectional events, room-based routing |
| Auth | Clerk | Managed auth, JWT verification, OAuth |
| Payments | Stripe | PCI-compliant, webhook support |
| Data Fetching | TanStack React Query v5 | Cache, mutations, background refresh |
| Validation | Zod | Runtime validation on API + client |
| Containers | Docker Compose | PostgreSQL + Redis local dev |

---

## 5. Order Lifecycle Data Flow

```
Customer adds items → POST /api/v1/orders
  → API validates truck, menu items, calculates total
  → API creates Stripe PaymentIntent
  → API creates Order (status=PENDING, paymentStatus=UNPAID)
  → API emits Socket.IO "order:new" to truck room
  → Owner Portal Kanban shows new card instantly

Customer confirms payment (Stripe client-side)
  → Stripe webhook: payment_intent.succeeded
  → API sets paymentStatus=PAID

Owner presses "Next" → PATCH /api/v1/orders/:id/status { status: PREPARING }
  → API updates DB
  → API emits Socket.IO "order:status" to order room
  → Mobile tracking screen updates instantly (no refresh)

Owner presses "Next" again → status: READY
  → Same flow → Mobile shows "Ready for Pickup 🎉"

Owner presses "Complete" → status: COMPLETED
  → Order archived, customer can leave a review
```

---

## 6. Non-Functional Requirements

| Requirement | Target | Implementation |
|---|---|---|
| API Latency | < 200ms p95 | Prisma connection pooling, Redis cache |
| Real-Time Latency | < 500ms | Socket.IO WebSocket (not long-poll) |
| Rate Limiting | 100 req/min per IP | @fastify/rate-limit |
| Security | OWASP Top 10 | Helmet, Zod validation, Clerk JWT |
| Scalability | Horizontal scale | Stateless API, Redis Socket.IO adapter (prod) |
| Geo Search | < 10ms | PostGIS spatial index on lat/lng |

---

## 7. Authentication Architecture

### Production Flow
```
Client → Clerk (sign in) → receives JWT
Client → API with "Authorization: Bearer <JWT>"
API → clerkClient.verifyToken(jwt) → { sub: clerkId }
API → DB: SELECT User WHERE clerkId = sub
API → attach user to request → route handler runs
```

### Dev Bypass (local development only)
```
Token                 → Role assigned
"dev_bypass"          → CUSTOMER  (mobile app)
"dev_bypass_owner"    → OWNER     (owner portal)
"dev_bypass_admin"    → ADMIN     (admin portal)
```
Set `DEV_BYPASS_TOKEN=dev_bypass` in `apps/api/.env` to activate.
**Remove before production deployment.**

### Role Guard Chain
```
requireAuth   = authenticate()
requireOwner  = authenticate() + role in [OWNER, ADMIN]
requireAdmin  = authenticate() + role === ADMIN
```

---

## 8. Real-Time Event Architecture

### Socket.IO Room Strategy
```
Room: "order:<orderId>"   ← Customer joins when opening tracking screen
Room: "truck:<truckId>"   ← Owner joins when Owner Portal loads
```

### Event Catalog

| Event | Direction | Trigger | Payload |
|---|---|---|---|
| `order:new` | Server → Owner | POST /orders | Full order object |
| `order:status` | Server → Customer | PATCH /orders/:id/status | `{ status, estimatedMins? }` |
| `truck:status` | Server → All | PATCH /trucks/:id/status | `{ isActive }` |

### Order Status State Machine
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
PENDING → CANCELLED
READY   → CANCELLED
```
