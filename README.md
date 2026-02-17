# Smart Airport Ride Pooling System

Backend Internship Assignment Submission

---

## 1. Overview

This project implements a backend system for smart airport ride pooling. The system dynamically groups compatible ride requests into shared vehicle pools while enforcing strict business constraints and maintaining transactional consistency.

Ride matching is based on:

- Seat availability  
- Luggage capacity  
- Detour tolerance  
- Route distance  
- Dynamic pricing  

The backend is built using:

- **Node.js (ES Modules)**
- **Express**
- **Prisma ORM**
- **PostgreSQL (Neon Free Tier)**
- RESTful APIs
- Postman for testing

---

## 2. High-Level Architecture

```
                ┌───────────────────────┐
                │       Client          │
                │     (Postman)         │
                └────────────┬──────────┘
                             │ HTTP
                             ▼
                ┌───────────────────────┐
                │      Express App      │
                │   (Routing Layer)     │
                └────────────┬──────────┘
                             ▼
                ┌───────────────────────┐
                │     Controllers       │
                └────────────┬──────────┘
                             ▼
                ┌───────────────────────┐
                │      Services         │
                │ (Business Logic)      │
                └────────────┬──────────┘
                             ▼
                ┌───────────────────────┐
                │    Repositories       │
                │   (Prisma ORM)        │
                └────────────┬──────────┘
                             ▼
                ┌───────────────────────┐
                │     PostgreSQL        │
                │      (Neon DB)        │
                └───────────────────────┘
```

### Architectural Principles

- Clear separation of concerns
- Service layer handles business logic
- Repository layer isolates database access
- All write operations executed inside transactions
- Scalable, modular structure

---

## 3. Low-Level Design

### Core Classes

**RideService**  
Responsible for:
- Ride creation
- Matching logic invocation
- Pool assignment
- Cancellation handling
- Pricing integration

**PoolService**  
Responsible for:
- Pool inspection APIs
- Fetching active pools

**PricingService**  
Encapsulates dynamic pricing formula.

**MatchingEngine**  
Implements ride-to-pool matching algorithm based on:
- Capacity constraints
- Detour tolerance

**Repositories (Repository Pattern)**
- RideRepository
- PoolRepository
- VehicleRepository

This follows the **Repository Pattern** and **Service Layer Pattern**, ensuring modularity and testability.

---

## 4. Database Design

### Core Entities

- User  
- Vehicle  
- Pool  
- RideRequest  
- PoolMember  

### Key Decisions

1. Pool is the aggregate root.
2. RideRequest connects to Pool via PoolMember.
3. Indexed fields:
   - Pool.status
   - RideRequest.status
   - PoolMember.poolId
   - createdAt timestamps

These indexes optimize active pool lookup and membership operations.

---

## 5. Matching Algorithm & Complexity

### Matching Steps

1. Fetch active pools
2. Filter pools with sufficient seat & luggage capacity
3. Compute detour percentage
4. Select first valid pool
5. If none found → create new pool

### Time Complexity

Let:

- N = number of active pools

Matching complexity:

```
O(N)
```

Each pool is evaluated once.

### Cancellation Complexity

- Pool member removal → O(1)
- Seat decrement → O(1)
- Route update → O(1)

### Database Operations

All critical operations are wrapped in:

```
prisma.$transaction()
```

Ensuring atomicity and concurrency safety.

---

## 6. Dynamic Pricing Model

Parameters:

```
Base Fare = 100
Rate per KM = 12
Pool Discount = 15%
```

Final price:

```
price = (baseFare + distance * ratePerKm + detourPenalty)
        * (1 - poolDiscount)
```

- Rounded to two decimal places
- Incentivizes ride pooling

---

## 7. Concurrency Handling Strategy

To support concurrent ride requests:

- All state-changing operations use database transactions.
- No global Prisma client usage inside transactions.
- Capacity validation occurs before allocation.
- Pool closing is atomic and conditional.

This prevents:

- Overbooking
- Double cancellation
- Partial updates
- Race conditions

---

## 8. API Endpoints

### Ride APIs

- `POST /api/rides`
- `POST /api/rides/:id/cancel`
- `GET /api/rides/:id`

### Pool APIs

- `GET /api/pools/active`
- `GET /api/pools/:id`

### Vehicle API

- `POST /api/vehicles/seed`

---

## 9. Edge Case Testing

Tested scenarios:

- Duplicate cancellation → rejected  
- Negative seats → rejected  
- Zero seats → rejected  
- Negative luggage → rejected  
- Invalid GPS coordinates → rejected  
- Overbooking attempts → rejected  
- Extreme detour tolerance → validated  
- Pool auto-closes when empty → verified  
- Route distance never becomes negative → enforced  

---

## 10. Setup Instructions

Install dependencies:

```
npm install
```

Configure environment:

```
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Run migration:

```
npx prisma migrate dev
```

Start server:

```
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## 11. Conclusion

The backend system:

- Maintains strict transactional integrity  
- Enforces business constraints  
- Prevents overbooking  
- Implements dynamic pricing  
- Manages pool lifecycle correctly  
- Handles edge cases robustly  

The solution is modular, scalable within assignment scope, and aligned with backend engineering best practices.

