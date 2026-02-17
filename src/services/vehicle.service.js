import vehicleRepository from "../repositories/vehicle.repository.js";

class VehicleService {
  async seedVehicles() {
    const vehicles = [
      { totalSeats:4,luggageCapacity:4},
      { totalSeats:6,luggageCapacity:6},
      { totalSeats:4,luggageCapacity:3}
    ];

    return vehicleRepository.createMany(vehicles);
  }
}

export default new VehicleService();
