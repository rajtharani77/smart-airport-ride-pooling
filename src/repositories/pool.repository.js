import prisma from "../config/db.js";

class PoolRepository {

  async findActivePoolsWithCapacity(seats, luggage, tx) {
    const pools = await tx.pool.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        vehicle: true
      }
    });

    return pools.filter(pool =>
      (pool.vehicle.totalSeats - pool.usedSeats) >= seats &&
      (pool.vehicle.luggageCapacity - pool.usedLuggage) >= luggage
    );
  }

  async createPool(vehicleId, tx) {
    return tx.pool.create({
      data: { vehicleId }
    });
  }

  async updatePoolUsage(poolId, seats, luggage, tx) {
    return tx.pool.update({
      where: { id: poolId },
      data: {
        usedSeats: { increment: seats },
        usedLuggage: { increment: luggage }
      }
    });
  }

  async addMember(poolId, rideRequestId, tx) {
    return tx.poolMember.create({
      data: {
        poolId,
        rideRequestId
      }
    });
  }

  async removeMember(rideRequestId, tx) {
    return tx.poolMember.delete({
      where: { rideRequestId }
    });
  }

  async decrementUsage(poolId, seats, luggage, tx) {
    return tx.pool.update({
      where: { id: poolId },
      data: {
        usedSeats: { decrement: seats },
        usedLuggage: { decrement: luggage }
      }
    });
  }

  async closePoolIfEmpty(poolId, tx) {
    const members = await tx.poolMember.count({
      where: { poolId }
    });

    if (members === 0) {
      return tx.pool.update({
        where: { id: poolId },
        data: { status: "CLOSED" }
      });
    }

    return null;
  }

  async getActivePools(tx) {
    return tx.pool.findMany({
      where: { status: "ACTIVE" },
      include: {
        vehicle: true,
        members: {
          include: {
            rideRequest: true
          }
        }
      }
    });
  }

  async getPoolById(poolId, tx) {
    return tx.pool.findUnique({
      where: { id: poolId },
      include: {
        vehicle: true,
        members: {
          include: {
            rideRequest: true
          }
        }
      }
    });
  }
}

export default new PoolRepository();
