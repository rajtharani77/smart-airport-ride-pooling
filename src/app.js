import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import vehicleRoutes from "./routes/vehicle.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import poolRoutes from "./routes/pool.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/pools", poolRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Smart Airport Ride Pooling API is running"
  });
});

export default app;
