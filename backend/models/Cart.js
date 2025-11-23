import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    restaurantId: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: {
      type: [cartItemSchema],
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
    metadata: {
      lastClientUpdate: Date,
      clientDevice: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
