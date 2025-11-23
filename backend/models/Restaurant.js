import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên nhà hàng"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cuisine: [
      {
        type: String,
        trim: true,
      },
    ],
    avatar: {
      type: String,
      default: "https://via.placeholder.com/300x200",
    },
    coverImage: {
      type: String,
      default: "https://via.placeholder.com/800x300",
    },
    address: {
      street: String,
      city: String,
      district: String,
      ward: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    estimatedDeliveryTime: {
      type: String,
      default: "30-45 phút",
    },
    dronePadSize: {
      type: Number,
    },
    brandStory: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isBusy: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Restaurant", restaurantSchema);
