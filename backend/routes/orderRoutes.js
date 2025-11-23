import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  confirmThirdPartyPayment,
  trackOrder,
  completeOrder,
} from "../controllers/orderController.js";
import { protect, restrictTo, optionalProtect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", optionalProtect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.get("/:id/track", protect, trackOrder);
router.post("/confirm-payment", optionalProtect, confirmThirdPartyPayment);
router.patch("/:id/complete", protect, completeOrder);
router.put(
  "/:id/status",
  protect,
  restrictTo("restaurant", "admin"),
  updateOrderStatus
);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
