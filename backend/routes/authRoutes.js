import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin routes
router.get("/users", protect, getAllUsers);
router.get("/users/:id", protect, getUserById);
router.put("/users/:id/status", protect, updateUserStatus);

export default router;
