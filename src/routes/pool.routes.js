import express from "express";
import poolController from "../controllers/pool.controller.js";

const router = express.Router();

router.get("/active", poolController.getActive);
router.get("/:id", poolController.getById);

export default router;
