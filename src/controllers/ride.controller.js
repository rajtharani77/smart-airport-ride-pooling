import rideService from "../services/ride.service.js";

class RideController {
  async create(req, res, next) {
    try {
      const result = await rideService.createRide(req.body);
      res.status(201).json({
        message: "Ride created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  async cancel(req, res, next) {
  try {
    const { id } = req.params;
    const result = await rideService.cancelRide(
      Number(id)
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
async getById(req, res, next) {
  try {const { id } = req.params;
    const ride = await rideService.getRideById(id);
    res.status(200).json(ride);
  } catch (error) {
    next(error);
  }
}
}

export default new RideController();
