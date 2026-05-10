# StreetBite — System Design (LLD)

## 1. Database Schema

### Models & Relationships

```
User
  id (PK, cuid)       clerkId (UK)    name          email (UK)
  phone               role (enum)     avatar        createdAt / updatedAt
  → owns FoodTruck[]  → places Order[]  → writes Review[]  → opens SupportTicket[]

FoodTruck
  id (PK)             ownerId (FK→User)   name          description
  cuisine (String[])  logo                coverImage    isApproved (default false)
  isActive (false)    commission (10%)    lat / lng     address
  createdAt / updatedAt
  → has MenuCategory[]  MenuItem[]  Order[]  TruckSchedule[]  Offer[]  Review[]

TruckSchedule
  id (PK)   truckId (FK)   dayOfWeek (0=Sun)   openTime   closeTime
  lat / lng   address   ← per-day location override

MenuCategory
  id (PK)   truckId (FK)   name   sortOrder
  → groups MenuItem[]

MenuItem
  id (PK)   truckId (FK)   categoryId (FK, nullable)   name   description
  price      image           isVeg (false)              isAvailable (true)
  createdAt / updatedAt
  → referenced by OrderItem[]

Order
  id (PK)             customerId (FK→User)   truckId (FK→FoodTruck)
  subtotal            discount (0)           commission    total
  status (enum)       paymentStatus (enum)   stripePaymentId
  offerId (FK)        estimatedMins          note
  createdAt / updatedAt
  → contains OrderItem[]   → can have one Review

OrderItem
  id (PK)   orderId (FK)   menuItemId (FK)   quantity   unitPrice   customNote

Offer
  id (PK)   truckId (FK)   code (UK)   discountType (FLAT/PERCENT)
  discountValue   minOrderValue   maxUses   usedCount   expiresAt   isActive

Review
  id (PK)   customerId (FK)   truckId (FK)   orderId (FK, UK — 1 review per order)
  rating (1-5)   comment   createdAt

SupportTicket
  id (PK)   userId (FK)   truckId (FK, nullable)   subject
  status (OPEN/IN_PROGRESS/RESOLVED)   createdAt / updatedAt
  → has TicketMessage[]

TicketMessage
  id (PK)   ticketId (FK)   senderId (FK→User)   body   createdAt
```

### Key Design Decisions
- `Order.commission` stores the computed amount at order-time, not derived from truck — preserves historical accuracy if commission rate changes later
- `Review` has a unique constraint on `orderId` — one review per completed order
- `TruckSchedule` stores per-day location so a truck can operate at different spots each day of the week
- `clerkId` is the bridge between Clerk's identity system and the local User table; synced via Clerk webhook

---

## 2. Full API Contract

### Route Groups

```
# Public
GET    /                              Service info
GET    /health                        Health + DB ping

# Trucks — public read, protected write
GET    /api/v1/trucks                 All approved trucks (no geo, dev-friendly)
GET    /api/v1/trucks/nearby          Geo search: ?lat=&lng=&radius= (requireAuth)
GET    /api/v1/trucks/:id             Truck detail + full categorized menu
GET    /api/v1/trucks/:id/reviews     Truck reviews (public)
GET    /api/v1/trucks/owner/me        Owner's truck + menu + schedule (requireOwner)
PATCH  /api/v1/trucks/:id             Update truck info (requireOwner)
PATCH  /api/v1/trucks/:id/status      Toggle isActive open/closed (requireOwner)

# Menu — requireOwner
POST   /api/v1/menu/categories        Create category
PATCH  /api/v1/menu/categories/:id    Rename / reorder category
DELETE /api/v1/menu/categories/:id    Delete category (cascades items)
PATCH  /api/v1/menu/categories/:id/bulk-availability  Toggle all items in category
POST   /api/v1/menu/items             Create item
PATCH  /api/v1/menu/items/:id         Edit item (name, price, isAvailable, etc.)
DELETE /api/v1/menu/items/:id         Delete item

# Orders — mixed auth
POST   /api/v1/orders                 Place order + create Stripe PaymentIntent (requireAuth)
GET    /api/v1/orders                 List orders — role-filtered (requireAuth)
GET    /api/v1/orders/:id             Order detail (requireAuth)
PATCH  /api/v1/orders/:id/status      Advance order status + emit Socket.IO (requireOwner)

# Offers
POST   /api/v1/offers                 Create offer (requireOwner)
GET    /api/v1/trucks/:id/offers      Public offer list for truck

# Reviews
POST   /api/v1/reviews                Submit review post-order (requireAuth)

# Support
POST   /api/v1/support/tickets        Open support ticket (requireAuth)
GET    /api/v1/support/tickets        My tickets (requireAuth)
POST   /api/v1/support/tickets/:id/messages  Send message

# Admin — requireAdmin
GET    /api/v1/admin/trucks           All trucks (paginated, includes owner info)
GET    /api/v1/admin/trucks/pending   Trucks awaiting approval
PATCH  /api/v1/admin/trucks/:id/approve     Approve or reject truck
PATCH  /api/v1/admin/trucks/:id/commission  Set commission percentage
GET    /api/v1/admin/users            All users (paginated, filterable by role)
GET    /api/v1/admin/analytics        Platform GMV, orders, trucks, customers

# Webhooks (no auth — signature verified)
POST   /webhooks/clerk                User sync on Clerk events
POST   /webhooks/stripe               Payment confirmation
```

### Standard Response Envelope
```json
// Success
{ "success": true, "data": { ... }, "meta": { "total": 100, "page": 1, "limit": 20 } }

// Error
{ "success": false, "message": "Human-readable description" }
```

### GET /api/v1/orders — Role Filtering Logic
```typescript
if (user.role === 'CUSTOMER') where.customerId = user.id
if (user.role === 'OWNER') {
  const truck = await prisma.foodTruck.findFirst({ where: { ownerId: user.id } })
  where.truckId = truck.id
}
// ADMIN sees all orders (no filter applied)
```

---

## 3. Component-Level Design

### 3.1 Mobile App — Screen Map

```
_layout.tsx (Root)
  ├── Providers: ClerkProvider, QueryClientProvider, GestureHandlerRootView
  ├── AuthGuard (DEV_MODE=true bypasses Clerk redirect)
  └── Stack Navigator
       ├── (auth)/welcome.tsx        Onboarding CTA
       ├── (auth)/sign-in.tsx        Clerk SignIn
       ├── (auth)/sign-up.tsx        Clerk SignUp
       ├── (tabs)/_layout.tsx        Bottom Tab Navigator
       │    ├── index.tsx            Home — truck list (GET /trucks)
       │    ├── search.tsx           Filter by cuisine/name
       │    ├── orders.tsx           Order history (GET /orders, 10s poll)
       │    └── profile.tsx          User profile
       ├── truck/[id].tsx            Truck detail + menu
       ├── order/[id].tsx            Real-time tracking (Socket.IO)
       └── checkout.tsx              Cart review + Stripe payment
```

### Key Component Data Flows

**Home Screen (index.tsx)**
```
useQuery(['trucks'])
  queryFn: GET /api/v1/trucks
  staleTime: 2 min
  → renders FlatList of TruckCard components
  → tap card → router.push('/truck/<id>')
```

**Order Tracking (order/[id].tsx)**
```
mount:
  useQuery(['order', id]) → GET /api/v1/orders/:id (initial state)
  io.connect(API_URL, { auth: { token: 'dev_bypass' } })
  socket.on('connect') → socket.emit('join:order', id)
  socket.on('order:status', (data) → queryClient.setQueryData → UI updates)

STATUS_TO_STEP mapping:
  PENDING=0  CONFIRMED=1  PREPARING=2  READY=3  COMPLETED=3

unmount:
  socket.emit('leave:order', id)
  socket.disconnect()
```

---

### 3.2 Owner Portal — Page Map

```
App.tsx (Routes)
  ├── /sign-in           Clerk SignIn
  ├── /sign-up           Clerk SignUp
  └── / (AuthGuard wraps DashboardLayout)
       ├── index          Dashboard.tsx — analytics
       ├── orders         Orders.tsx   — Kanban + Socket.IO
       ├── menu           Menu.tsx     — menu CRUD
       └── settings       Settings.tsx — truck config + schedule
```

**Orders.tsx — Full Real-Time Flow**
```
mount:
  useQuery(['owner-orders']) → GET /api/v1/orders (OWNER gets only their truck's orders)
  refetchInterval: 15000 (Socket.IO fallback)
  io.connect({ auth: { token: 'dev_bypass_owner' } })
  socket.on('order:new')    → invalidateQueries(['owner-orders'])
  socket.on('order:status') → invalidateQueries(['owner-orders'])

user clicks "Next":
  useMutation → PATCH /api/v1/orders/:id/status { status: nextStatus }
  onSuccess   → invalidateQueries(['owner-orders'])
  API side    → emitOrderStatus(io, orderId, { status }) → customer mobile updates

Kanban columns: PENDING | PREPARING | READY (only active statuses shown)
```

**Menu.tsx — Data Flow**
```
useQuery(['owner-truck']) → GET /api/v1/trucks/owner/me
  → response.data.categories[].items[]

Toggle availability:
  useMutation → PATCH /api/v1/menu/items/:id { isAvailable: !current }
  onSuccess   → invalidateQueries(['owner-truck'])

Delete item:
  useMutation → DELETE /api/v1/menu/items/:id
  onSuccess   → invalidateQueries(['owner-truck'])
```

---

### 3.3 Admin Portal — Page Map

```
App.tsx (Routes)
  ├── /sign-in           Clerk SignIn
  └── / (AuthGuard wraps layout)
       ├── index          Dashboard.tsx — platform analytics
       ├── trucks         Trucks.tsx   — truck management table
       └── users          Users.tsx    — user management table
```

**Analytics Aggregation (GET /api/v1/admin/analytics)**
```typescript
// 4 parallel Prisma queries
const [totalOrders, totalGMV, totalTrucks, totalUsers] = await Promise.all([
  prisma.order.count({ where: { paymentStatus: 'PAID' } }),
  prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
  prisma.foodTruck.count({ where: { isApproved: true } }),
  prisma.user.count({ where: { role: 'CUSTOMER' } }),
])
```

---

## 4. State Management Strategy

### React Query Configuration
```typescript
// Applied globally in all apps
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,  // 5 min default
    }
  }
})

// Per-screen overrides
orders.tsx (mobile):       refetchInterval: 10_000
Orders.tsx (owner portal): refetchInterval: 15_000
trucks list:               staleTime: 1000 * 60 * 2
```

### Invalidation vs. setQueryData
- **setQueryData** — used in order tracking screen for instant Socket.IO updates (no network round-trip)
- **invalidateQueries** — used after mutations in Owner Portal (ensures fresh server state)
- Optimistic updates are intentionally **not used** — order status accuracy is more important than perceived speed

---

## 5. Monorepo File Structure

```
streetbite/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma        Single source of truth for all models
│   │   │   └── seed.ts              Creates Admin, Owner, Customer, Truck, Menu, Order
│   │   └── src/
│   │       ├── index.ts             App bootstrap, plugin/route registration
│   │       ├── lib/
│   │       │   ├── env.ts           Zod-validated env vars (fails fast on missing)
│   │       │   ├── logger.ts        Pino logger (JSON in prod, pretty in dev)
│   │       │   └── prisma.ts        Singleton PrismaClient
│   │       ├── middleware/
│   │       │   └── auth.ts          authenticate / requireAuth / requireOwner / requireAdmin
│   │       ├── plugins/
│   │       │   └── socket.ts        Socket.IO setup + emit helpers
│   │       └── routes/v1/
│   │           ├── trucks.ts        GET / , /nearby, /owner/me, /:id
│   │           ├── menu.ts          POST/PATCH/DELETE categories + items
│   │           ├── orders.ts        Full order CRUD + status PATCH
│   │           ├── admin.ts         Admin-only routes
│   │           ├── offers.ts        Offer CRUD
│   │           ├── reviews.ts       Review submission
│   │           ├── support.ts       Support ticket system
│   │           ├── webhooks.ts      Clerk + Stripe webhook handlers
│   │           └── health.ts        GET /health (DB ping)
│   │
│   ├── mobile/
│   │   ├── app/                     Expo Router file-based routes
│   │   │   ├── _layout.tsx          Root: providers + AuthGuard
│   │   │   ├── (auth)/              Unauthenticated screens
│   │   │   ├── (tabs)/              Bottom tab screens
│   │   │   ├── truck/[id].tsx       Truck detail + menu
│   │   │   ├── order/[id].tsx       Real-time order tracking
│   │   │   └── checkout.tsx         Cart + Stripe
│   │   ├── components/              Reusable UI (TruckCard, MenuCard, etc.)
│   │   └── constants/theme.ts       Design tokens: Colors, Typography, Spacing
│   │
│   ├── owner-portal/
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── api.ts           apiRequest() — injects dev_bypass_owner token
│   │       │   └── mockData.ts      Deprecated (no longer imported)
│   │       ├── pages/
│   │       │   ├── Dashboard.tsx    Analytics from /admin/analytics
│   │       │   ├── Orders.tsx       Kanban + Socket.IO live updates
│   │       │   ├── Menu.tsx         Menu CRUD via /trucks/owner/me
│   │       │   └── Settings.tsx     Truck profile + weekly schedule
│   │       └── components/layouts/
│   │           └── DashboardLayout.tsx  Sidebar nav + outlet
│   │
│   └── admin-portal/
│       └── src/
│           ├── lib/api.ts           apiRequest() — injects dev_bypass_admin token
│           └── pages/
│               ├── Dashboard.tsx    Platform analytics
│               ├── Trucks.tsx       Truck management table
│               └── Users.tsx        User management table
│
├── packages/
│   ├── shared-types/                Shared TypeScript interfaces across apps
│   ├── eslint-config/               Shared ESLint rules
│   └── typescript-config/           Shared tsconfig bases
│
├── docker-compose.yml               PostgreSQL + Redis containers
├── turbo.json                       Pipeline: dev, build, lint, typecheck
├── DEVOPS.md                        Commands, logs, DB management guide
├── HLD.md                           This document — High-Level Design
└── LLD.md                           This document — Low-Level Design
```

---

## 6. Enum Reference

| Enum | Values | Used In |
|---|---|---|
| `Role` | CUSTOMER, OWNER, ADMIN | User, auth middleware |
| `OrderStatus` | PENDING → CONFIRMED → PREPARING → READY → COMPLETED / CANCELLED | Order, Kanban |
| `PaymentStatus` | UNPAID, PAID, REFUNDED | Order, Stripe webhook |
| `DiscountType` | FLAT, PERCENT | Offer |
| `TicketStatus` | OPEN, IN_PROGRESS, RESOLVED | SupportTicket |
