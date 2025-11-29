import express from "express";
import { confirmThirdPartyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Confirm payment (used by PayPal)
router.post("/third-party/confirm", confirmThirdPartyPayment);

export default router;
