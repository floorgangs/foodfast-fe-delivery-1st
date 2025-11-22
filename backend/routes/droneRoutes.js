import express from "express";
import {
  getAllDrones,
  getDrone,
  getRestaurantDrones,
  createDrone,
  updateDrone,
  updateDroneStatus,
  updateDroneLocation,
  deleteDrone,
} from "../controllers/droneController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllDrones);
router.get("/:id", getDrone);
router.get("/restaurant/:restaurantId", getRestaurantDrones);

// Protected routes
router.use(protect);

// Restaurant & Admin routes
router.post("/", authorize("restaurant", "admin"), createDrone);
router.put("/:id", authorize("restaurant", "admin"), updateDrone);
router.put("/:id/status", authorize("restaurant", "admin"), updateDroneStatus);
router.put(
  "/:id/location",
  authorize("restaurant", "admin"),
  updateDroneLocation
);
router.delete("/:id", authorize("restaurant", "admin"), deleteDrone);

export default router;
