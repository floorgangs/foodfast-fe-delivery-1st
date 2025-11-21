import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  getMyRestaurant,
} from "../controllers/restaurantController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getRestaurants);
router.get(
  "/my-restaurant",
  protect,
  restrictTo("restaurant"),
  getMyRestaurant
);
router.get("/:id", getRestaurant);
router.post("/", protect, restrictTo("restaurant", "admin"), createRestaurant);
router.put(
  "/:id",
  protect,
  restrictTo("restaurant", "admin"),
  updateRestaurant
);

export default router;
