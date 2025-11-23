import express from "express";
import {
  getSavedOrders,
  createSavedOrder,
  updateSavedOrder,
  deleteSavedOrder,
  orderFromSaved,
} from "../controllers/savedOrderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getSavedOrders);
router.post("/", createSavedOrder);
router.put("/:id", updateSavedOrder);
router.delete("/:id", deleteSavedOrder);
router.post("/:id/order", orderFromSaved);

export default router;
