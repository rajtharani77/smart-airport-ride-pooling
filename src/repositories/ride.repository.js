import prisma from "../config/db.js";

class RideRepository {
  async createRide(data, tx) {
    return tx.rideRequest.create({ data });
  }

  async updateStatus(id, status, tx) {
    return tx.rideRequest.update({
      where: { id },
      data: { status }
    });
  }

  async findById(id, tx) {
    return tx.rideRequest.findUnique({
      where: { id },
      include: {
        poolMember: {
          include: {
            pool: true
          }
        }
      }
    });
  }
  async getRideById(id, tx) {
  return tx.rideRequest.findUnique({
    where: { id },
    include: {
      poolMember: {
        include: {
          pool: true
        }
      }
    }
  });
}
}

export default new RideRepository();
