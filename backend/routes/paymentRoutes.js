import express from "express";
import {
  createVNPayPayment,
  vnpayReturn,
  createMoMoPayment,
  momoReturn,
  momoIPN,
  confirmThirdPartyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// VNPay routes
router.post("/vnpay/create", createVNPayPayment);
router.get("/vnpay/return", vnpayReturn);

// MoMo routes
router.post("/momo/create", createMoMoPayment);
router.get("/momo/return", momoReturn);
router.post("/momo/ipn", momoIPN);

// Legacy route
router.post("/third-party/confirm", confirmThirdPartyPayment);

export default router;
