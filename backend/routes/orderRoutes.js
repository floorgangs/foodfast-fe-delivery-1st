import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, restrictTo("customer"), createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.put(
  "/:id/status",
  protect,
  restrictTo("restaurant", "admin"),
  updateOrderStatus
);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
