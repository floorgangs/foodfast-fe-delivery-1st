import express from "express";
import {
  getSettings,
  updateSettings,
  updateSystemBalance,
  getFinancialSummary,
} from "../controllers/adminSettingsController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/balance", updateSystemBalance);
router.get("/financial-summary", getFinancialSummary);

export default router;
