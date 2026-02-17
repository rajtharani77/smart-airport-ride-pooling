import vehicleService from "../services/vehicle.service.js";

class VehicleController {
  async seed(req, res, next) {
    try {await vehicleService.seedVehicles();
      res.status(201).json({message: "Vehicles seeded successfully"});
    } catch (error) {
      next(error);
    }
  }
}

export default new VehicleController();
