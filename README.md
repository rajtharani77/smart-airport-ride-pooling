Smart Airport Ride Pooling System

Backend Assignment Submission

1 Overview

This project implements a backend system for smart airport ride pooling. The system dynamically matches ride requests into vehicle pools based on:

Seat availability
Luggage constraints
Detour tolerance
Route distance
Dynamic pricing

The primary goal is to efficiently group compatible ride requests while maintaining strict transactional integrity and constraint enforcement.

The backend is implemented using:

Node.js (ES Modules)
Express
Prisma ORM
PostgreSQL (Neon free-tier)
RESTful APIs
Postman for testing

2 System Architecture

The project follows layered architecture:

Routes → Controllers → Services → Repositories → Database

Route Layer
Handles API endpoints and request routing.

Controller Layer
Manages request-response cycle and error propagation.

Service Layer:- Contains business logic:

Ride matching
Pool creation
Cancellation handling
Pricing calculation

Repository Layer
Responsible for all database interactions using Prisma.

Database Layer
PostgreSQL with indexed relational schema.

3 Database Schema Design

Core Entities:

User
Vehicle
Pool
RideRequest
PoolMember

Key Design Decisions

1. Pool is the aggregate root.
2. PoolMember maintains many-to-one relation with Pool.
3. RideRequest has optional relation to PoolMember.
4. Indexes added on:

    1. Pool.status
    2. RideRequest.status
    3. PoolMember.poolId
    4. createdAt fields

4 Matching Strategy
Matching logic evaluates: 
1. Active pools with sufficient capacity
2. Detour tolerance
3. Seat availability
4. Luggage capacity

Detour is calculated as: detourPercent = (existingRouteDistance/directDistance)*100
A ride joins a pool only if:detourPercent <= ride.detourTolerancePercent
If no suitable pool exists, a new pool is created using an available vehicle that satisfies capacity requirements.

5 Dynamic Pricing Model

Pricing formula:

Base Fare = 100
Rate per KM = 12
Pool Discount = 15%
Detour penalty = proportional to detour %


Final price:
price = (baseFare+distance*ratePerKm+detourPenalty)* (1-poolDiscount)


Rounded to 2 decimal places.

This ensures:

Fair pricing
Incentivized pooling
Adjustable economic parameters

6 Transaction Handling

All write operations use: prisma.$transaction()


Ensuring:

1. Atomic pool assignment
2. Atomic cancellation
3. No partial updates
4. No seat inconsistency
5. No route inconsistency
Every database call inside transaction strictly uses tx client.


7 API Endpoints
Ride APIs

Create Ride
POST /api/rides


Example request:
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

Expected response:

{
  "message": "Ride created successfully",
  "data": {
    "rideId": 4,
    "poolId": 3,
    "price": 278.96,
    "message": "New pool created"
  }
}

Cancel Ride
POST /api/rides/:id/cancel


Expected response:

{
  "rideId": 4,
  "message": "Ride cancelled successfully"
}


If already cancelled:
Error: Ride already cancelled

Get Ride
GET /api/rides/:id

Pool APIs
Get Active Pools
GET /api/pools/active

Get Pool by ID
GET /api/pools/:id


Returns:

1. Vehicle info
2. Members
3. Route distance
4. Status


Vehicle API
Seed Vehicles
POST /api/vehicles/seed

8 Edge Case Testing Summary

1. The following were tested and validated:
2. Duplicate cancellation → rejected
3. Negative seats → rejected
4. Zero seats → rejected
5. Negative luggage → rejected
6. Invalid GPS coordinates → rejected
7. Overbooking beyond vehicle capacity → rejected
8. Extreme detour tolerance → validate
9. Pool auto-closes when empty → verified
10. Route distance never negative → enforced


9️ Setup Instructions

1. Install Dependencies
npm install

2. Setup Environment
Create .env: DATABASE_URL="postgresql://<user>:<password>@<neon-host>-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

3. Run Prisma Migration
npx prisma migrate dev

4. Start Server
npm run dev


Server runs on:

http://localhost:5000

10 Performance Considerations

1. Indexed columns reduce lookup time.
2. Capacity filtering done before matching.
3. Transaction guarantees consistency.
4. Matching complexity: O(n) over active pools.
5. Scalable for moderate concurrency (100 RPS).


11 Design Trade-offs

1. Simplified detour model (no route optimization graph)
2. In-memory filtering after DB query for capacity
3. No external mapping API integration
4. No advanced surge pricing logic
5. These were conscious simplifications to keep system reliable within assignment scope.

12 Conclusion

The backend system:
1. Maintains data integrity
2. Enforces strict business constraints
3. Prevents overbooking
4. Supports dynamic pricing
5. Handles ride lifecycle cleanly
6. Uses transactional safety
7. Has been tested against edge cases