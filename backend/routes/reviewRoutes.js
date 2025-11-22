import express from "express";
import {
  getReviews,
  getReviewSummary,
  createReview,
  replyToReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/summary", getReviewSummary);
router.post("/", protect, restrictTo("customer"), createReview);
router.post(
  "/:id/reply",
  protect,
  restrictTo("restaurant", "admin"),
  replyToReview
);

export default router;
