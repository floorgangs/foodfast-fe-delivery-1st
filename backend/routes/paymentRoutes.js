import express from "express";
import { confirmThirdPartyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/third-party/confirm", confirmThirdPartyPayment);

export default router;
