import express from "express";
import rideController from "../controllers/ride.controller.js";

const router = express.Router();

router.post("/", rideController.create);
router.post("/:id/cancel", rideController.cancel);
router.get("/:id", rideController.getById);

export default router;
