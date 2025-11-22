import express from "express";
import {
  getAllVouchers,
  getVoucher,
  applyVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../controllers/voucherController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllVouchers);
router.get("/:id", getVoucher);

// Protected routes
router.use(protect);
router.post("/apply", applyVoucher);

// Admin routes
router.post("/", authorize("admin"), createVoucher);
router.put("/:id", authorize("admin"), updateVoucher);
router.delete("/:id", authorize("admin"), deleteVoucher);

export default router;
