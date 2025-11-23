import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    total: {
      type: Number,
      default: 0,
    },
    currentRestaurantId: {
      type: String,
      default: null,
    },
    currentRestaurantName: {
      type: String,
      default: null,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.model("Cart", cartSchema);
