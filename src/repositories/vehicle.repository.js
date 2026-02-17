import prisma from "../config/db.js";

class VehicleRepository {
  async createMany(vehicles) {
    return prisma.vehicle.createMany({
      data: vehicles
    });
  }
  async findAvailableVehicle(seats, luggage, tx) {
  return tx.vehicle.findFirst({
    where: {
      isActive: true,
      totalSeats: {
        gte: seats
      },
      luggageCapacity: {
        gte: luggage
      }
    }
  });
  }
}
export default new VehicleRepository();
