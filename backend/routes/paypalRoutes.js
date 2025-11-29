import express from "express";
import {
  createPayPalOrder,
  capturePayPalOrder,
  handlePayPalWebhook,
} from "../controllers/paypalController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Tạo đơn hàng PayPal (yêu cầu đăng nhập)
router.post("/create-order", protect, createPayPalOrder);

// Xác nhận thanh toán PayPal (yêu cầu đăng nhập)
router.post("/capture-order", protect, capturePayPalOrder);

// Webhook từ PayPal (không cần auth)
router.post("/webhook", handlePayPalWebhook);

export default router;
