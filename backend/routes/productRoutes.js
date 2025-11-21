import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", protect, restrictTo("restaurant", "admin"), createProduct);
router.put("/:id", protect, restrictTo("restaurant", "admin"), updateProduct);
router.delete(
  "/:id",
  protect,
  restrictTo("restaurant", "admin"),
  deleteProduct
);

export default router;
