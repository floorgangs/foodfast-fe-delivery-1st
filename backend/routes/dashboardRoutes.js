import express from "express";
import {
  getDashboardStats,
  getRecentOrders,
  getPendingRestaurants,
} from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Chỉ admin mới truy cập được
router.get("/stats", protect, restrictTo("admin"), getDashboardStats);
router.get(
  "/recent-orders",
  protect,
  restrictTo("admin"),
  getRecentOrders
);
router.get(
  "/pending-restaurants",
  protect,
  restrictTo("admin"),
  getPendingRestaurants
);

export default router;
