# Smart Airport Ride Pooling System

Backend Internship Assignment Submission

---

## Overview

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

## Architecture

The system follows a layered architecture:

```
Routes → Controllers → Services → Repositories → Database
```

### Route Layer
Defines and organizes API endpoints.

### Controller Layer
Handles request-response flow and error propagation.

### Service Layer
Contains core business logic:
- Ride matching
- Pool allocation
- Cancellation handling
- Dynamic pricing

### Repository Layer
Handles database operations using Prisma.

### Database Layer
PostgreSQL with indexed relational schema.

This separation ensures maintainability, clarity, and scalability.

---

## Database Design

### Core Entities

- **User**
- **Vehicle**
- **Pool**
- **RideRequest**
- **PoolMember**

### Key Design Decisions

1. **Pool acts as the aggregate root.**
2. A ride is linked to a pool via `PoolMember`.
3. Indexes are added on:
   - `Pool.status`
   - `RideRequest.status`
   - `PoolMember.poolId`
   - `createdAt` fields

This ensures efficient lookups for active pools and member queries.

---

## Ride Matching Strategy

Matching logic evaluates:

1. Active pools
2. Available seats
3. Luggage capacity
4. Detour tolerance

Detour is calculated as:

```
detourPercent = (existingRouteDistance / directDistance) * 100
```

A ride joins a pool only if:

```
detourPercent <= ride.detourTolerancePercent
```

If no suitable pool exists, a new pool is created using a vehicle that satisfies seat and luggage constraints.

---

## Dynamic Pricing Model

Pricing is distance-based and incentive-driven.

**Parameters:**

```
Base Fare = 100
Rate per KM = 12
Pool Discount = 15%
```

Final price calculation:

```
price = (baseFare + distance * ratePerKm + detourPenalty)
        * (1 - poolDiscount)
```

- Rounded to two decimal places
- Encourages ride pooling
- Fair and transparent pricing

---

## Transaction Handling

All write operations are wrapped in:

```
prisma.$transaction()
```

This guarantees:

- Atomic pool assignment  
- Atomic cancellation  
- No partial updates  
- No seat inconsistency  
- No negative route distance  
- No overbooking  

Every database operation inside transactions strictly uses the `tx` client.

---

## API Endpoints

### Ride APIs

#### Create Ride

`POST /api/rides`

**Request Body**

```json
{
  "userId": 1,
  "pickupLat": 19.076,
  "pickupLng": 72.8777,
  "dropLat": 19.2183,
  "dropLng": 72.9781,
  "seatsRequired": 1,
  "luggageUnits": 1,
  "detourTolerancePercent": 20
}
```

**Response**

```json
{
  "message": "Ride created successfully",
  "data": {
    "rideId": 4,
    "poolId": 3,
    "price": 278.96,
    "message": "New pool created"
  }
}
```

---

#### Cancel Ride

`POST /api/rides/:id/cancel`

**Response**

```json
{
  "rideId": 4,
  "message": "Ride cancelled successfully"
}
```

If already cancelled:

```
Error: Ride already cancelled
```

---

#### Get Ride Details

`GET /api/rides/:id`

Returns ride information including pool association.

---

### Pool APIs

- `GET /api/pools/active`
- `GET /api/pools/:id`

Returns:
- Vehicle details
- Pool members
- Route distance
- Status

---

### Vehicle API

`POST /api/vehicles/seed`

Seeds sample vehicles for testing.

---

## Edge Case Testing

The following scenarios were tested and validated:

- Duplicate cancellation → rejected  
- Negative seats → rejected  
- Zero seats → rejected  
- Negative luggage → rejected  
- Invalid GPS coordinates → rejected  
- Overbooking attempts → rejected  
- Extreme detour tolerance → validated  
- Pool auto-closes when empty → verified  
- Route distance never becomes negative → enforced  

All constraints behave as expected.

---

## Setup Instructions

### 1. Install Dependencies

```
npm install
```

### 2. Configure Environment

Create a `.env` file:

```
DATABASE_URL="postgresql://<user>:<password>@<host>-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Prisma Migration

```
npx prisma migrate dev
```

### 4. Start Server

```
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## Performance Considerations

- Indexed columns improve active pool lookup performance.
- Capacity filtering reduces unnecessary matching.
- Transaction guarantees consistency.
- Matching complexity: O(n) over active pools.
- Suitable for moderate concurrency (~100 requests per second).

---

## Design Trade-offs

- Simplified detour model (no advanced route optimization).
- No external mapping API integration.
- In-memory capacity filtering after DB query.
- No surge pricing logic.

These were conscious decisions to maintain clarity and stability within assignment scope.

---

## Conclusion

The backend system:

- Maintains strict transactional integrity  
- Enforces all business constraints  
- Prevents overbooking  
- Implements dynamic pricing  
- Manages pool lifecycle cleanly  
- Has been tested across multiple edge cases  

The system is stable, consistent, and production-structured within the scope of this assignment.

