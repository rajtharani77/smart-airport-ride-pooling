import express from "express";
import vehicleController from "../controllers/vehicle.controller.js";

const router = express.Router();

router.post("/seed", vehicleController.seed);

export default router;
