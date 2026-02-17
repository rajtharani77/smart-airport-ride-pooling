import { calculateDistance } from "../utils/haversine.js";

class MatchingEngine {
  findBestPool(ride, pools) {
    let bestPool = null;
    let minDetour = Infinity;

    for (const pool of pools) {
      const availableSeats = pool.vehicle.totalSeats - pool.usedSeats;

      const availableLuggage = pool.vehicle.luggageCapacity - pool.usedLuggage;

      if (availableSeats >= ride.seatsRequired && availableLuggage >= ride.luggageUnits) {
        const directDistance = calculateDistance(
          ride.pickupLat,
          ride.pickupLng,
          ride.dropLat,
          ride.dropLng
        );

        const poolDistance = pool.routeDistance || 0;

        const pickupToPool = calculateDistance(
          ride.pickupLat,
          ride.pickupLng,
          ride.dropLat,
          ride.dropLng
        );

        const newDistance = poolDistance + pickupToPool;

        const detourPercent =((newDistance - directDistance)/directDistance)*100;

        if (detourPercent<=ride.detourTolerancePercent) {
          if (detourPercent<minDetour) {
            minDetour= detourPercent;
            bestPool=pool;
          }
        }
      }
    }

    return bestPool;
  }
}

export default new MatchingEngine();
