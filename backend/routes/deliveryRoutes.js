import express from "express";
import {
  getAvailableDrones,
  assignDroneToOrder,
  startDelivery,
  completeDelivery,
  getDeliveryTracking,
  updateDroneLocation,
  getDroneLocationHistory,
} from "../controllers/deliveryController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get available drones for delivery
router.get("/drones/available", protect, getAvailableDrones);

// Assign drone to order
router.post("/assign", protect, assignDroneToOrder);

// Start delivery (pickup)
router.patch("/:deliveryId/start", protect, startDelivery);

// Complete delivery
router.patch("/:deliveryId/complete", protect, completeDelivery);

// Get delivery tracking info
router.get("/tracking/:orderId", getDeliveryTracking);

// Update drone location
router.patch("/drone/:droneId/location", updateDroneLocation);

// Get drone location history
router.get("/drone/:droneId/location-history", getDroneLocationHistory);

export default router;
