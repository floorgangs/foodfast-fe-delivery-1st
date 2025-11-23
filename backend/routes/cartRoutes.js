import express from "express";
import { getCart, upsertCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.put("/", upsertCart);
router.delete("/", clearCart);

export default router;
