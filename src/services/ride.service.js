import prisma from "../config/db.js";
import rideRepository from "../repositories/ride.repository.js";
import poolRepository from "../repositories/pool.repository.js";
import vehicleRepository from "../repositories/vehicle.repository.js";
import matchingEngine from "../matching/matching.engine.js";
import { calculateDistance } from "../utils/haversine.js";
import pricingService from "./pricing.service.js";

class RideService {

  async createRide(data) {
  return prisma.$transaction(async (tx) => {

    if (!data.userId) {
      throw new Error("User ID is required");
    }
    if (data.seatsRequired <= 0 ||!Number.isInteger(data.seatsRequired)) {
      throw new Error("Seats must be a positive integer");
    }
    if ( data.luggageUnits < 0 ||!Number.isInteger(data.luggageUnits)) {
      throw new Error("Luggage units must be a non-negative integer");
    }
    if (data.detourTolerancePercent < 0 ||data.detourTolerancePercent > 500) {
      throw new Error("Invalid detour tolerance value");
    }
    if ( Math.abs(data.pickupLat) > 90 || Math.abs(data.dropLat) > 90 ||
      Math.abs(data.pickupLng) > 180 || Math.abs(data.dropLng) > 180) {
      throw new Error("Invalid coordinates");
    }

    const ride = await rideRepository.createRide(data, tx);

    const activePools =
      await poolRepository.findActivePoolsWithCapacity(
        ride.seatsRequired,
        ride.luggageUnits,
        tx
      );

    const bestPool = matchingEngine.findBestPool(
      ride,
      activePools
    );

    const directDistance = calculateDistance(
      ride.pickupLat,
      ride.pickupLng,
      ride.dropLat,
      ride.dropLng
    );

    let detourPercent = 0;

    if (bestPool && bestPool.routeDistance > 0) {
      detourPercent =(bestPool.routeDistance / directDistance) * 100;
    }

    const price = pricingService.calculatePrice({distance: directDistance, detourPercent});

    if (bestPool) {
      await poolRepository.updatePoolUsage(
        bestPool.id,
        ride.seatsRequired,
        ride.luggageUnits,
        tx
      );
      await poolRepository.addMember(
        bestPool.id,
        ride.id,
        tx
      );
      await tx.pool.update({
        where: { id: bestPool.id },
        data: {
          routeDistance: {
            increment: directDistance
          }
        }
      });

      await tx.rideRequest.update({
        where: { id: ride.id },
        data: {
          status: "MATCHED",
          price
        }
      });

      return {
        rideId: ride.id,
        poolId: bestPool.id,
        price,
        message: "Joined existing pool"
      };
    }
    const vehicle = await vehicleRepository.findAvailableVehicle(
        ride.seatsRequired,
        ride.luggageUnits,
        tx
      );

    if (!vehicle) {
      throw new Error("No vehicles available");
    }

    const newPool =await poolRepository.createPool(
        vehicle.id,
        tx
      );

    await poolRepository.updatePoolUsage(
      newPool.id,
      ride.seatsRequired,
      ride.luggageUnits,
      tx
    );
    await poolRepository.addMember(
      newPool.id,
      ride.id,
      tx
    );
    await tx.pool.update({
      where: { id: newPool.id },
      data: {
        routeDistance: directDistance
      }
    });
    await tx.rideRequest.update({
      where: { id: ride.id },
      data: {
        status: "MATCHED",
        price
      }
    });
    return {
      rideId: ride.id,
      poolId: newPool.id,
      price,
      message: "New pool created"
    };
  });
  }
  async cancelRide(rideId) {
    return prisma.$transaction(async (tx) => {

      const ride = await rideRepository.findById(rideId, tx);

      if (!ride) {
        throw new Error("Ride not found");
      }
      if (ride.status === "CANCELLED") {
        throw new Error("Ride already cancelled");
      }
      if (!ride.poolMember) {
        throw new Error("Ride not assigned to any pool");
      }

      const poolId = ride.poolMember.poolId;

      const directDistance = calculateDistance(
        ride.pickupLat,
        ride.pickupLng,
        ride.dropLat,
        ride.dropLng
      );
      await poolRepository.removeMember(
        rideId,
        tx
      );

      await poolRepository.decrementUsage(
        poolId,
        ride.seatsRequired,
        ride.luggageUnits,
        tx
      );

      const pool = await tx.pool.findUnique({
        where: { id: poolId }
      });

      const updatedDistance = Math.max( 0,(pool.routeDistance || 0) - directDistance);

      await tx.pool.update({
        where: { id: poolId },
        data: {
          routeDistance: updatedDistance
        }
      });

      await poolRepository.closePoolIfEmpty(
        poolId,
        tx
      );

      await rideRepository.updateStatus(
        rideId,
        "CANCELLED",
        tx
      );
      return {
        rideId,
        message: "Ride cancelled successfully"
      };
    });
  }
  async getRideById(rideId) {
    return prisma.$transaction(async (tx) => {

      const ride =await rideRepository.getRideById(
          Number(rideId),
          tx
        );

      if (!ride) {
        throw new Error("Ride not found");
      }
      return ride;
    });
  }
}
export default new RideService();
