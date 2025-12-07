import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
  restaurantLogin,
  getPendingRestaurants,
  getAllRestaurantsAdmin,
  approveRestaurant,
  rejectRestaurant,
  getRestaurantCompliance,
  createRestaurantWithOwner,
} from "../controllers/restaurantController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", restaurantLogin);
router.get("/", getRestaurants);

// Protected routes - phải đặt TRƯỚC route /:id để tránh conflict
router.get(
  "/my-restaurant",
  protect,
  restrictTo("restaurant"),
  getMyRestaurant
);

// Admin routes - phải đặt TRƯỚC route /:id
router.get(
  "/admin/pending",
  protect,
  restrictTo("admin"),
  getPendingRestaurants
);
router.get("/admin/all", protect, restrictTo("admin"), getAllRestaurantsAdmin);
router.post(
  "/admin/create-with-owner",
  protect,
  restrictTo("admin"),
  createRestaurantWithOwner
);
router.put(
  "/admin/:id/approve",
  protect,
  restrictTo("admin"),
  approveRestaurant
);
router.put("/admin/:id/reject", protect, restrictTo("admin"), rejectRestaurant);
router.get(
  "/admin/:id/compliance",
  protect,
  restrictTo("admin"),
  getRestaurantCompliance
);

// General protected routes
router.post("/", protect, restrictTo("restaurant", "admin"), createRestaurant);
router.put(
  "/:id",
  protect,
  restrictTo("restaurant", "admin"),
  updateRestaurant
);
router.delete("/:id", protect, restrictTo("admin"), deleteRestaurant);

// Route có param :id phải đặt SAU các route cụ thể
router.get("/:id", getRestaurant);

export default router;
