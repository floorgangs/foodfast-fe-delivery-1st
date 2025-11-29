import express from "express";
import {
  getRestaurantStaff,
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get("/all", admin, getAllStaff);

// Restaurant staff routes
router.get("/restaurant/:restaurantId", getRestaurantStaff);
router.post("/restaurant/:restaurantId", addStaff);
router.put("/:staffId", updateStaff);
router.delete("/:staffId", deleteStaff);

export default router;
