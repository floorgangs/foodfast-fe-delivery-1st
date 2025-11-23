import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  getMyRestaurant,
  restaurantLogin,
} from "../controllers/restaurantController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", restaurantLogin);
router.get("/", getRestaurants);
router.get("/:id", getRestaurant);

// Protected routes
router.get(
  "/my-restaurant",
  protect,
  restrictTo("restaurant"),
  getMyRestaurant
);
router.post("/", protect, restrictTo("restaurant", "admin"), createRestaurant);
router.put(
  "/:id",
  protect,
  restrictTo("restaurant", "admin"),
  updateRestaurant
);

export default router;
