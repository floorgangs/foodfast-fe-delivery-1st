import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên món ăn"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300x300",
    },
    images: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: String,
      default: "15-20 phút",
    },
    tags: [String],
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
    soldCount: {
      type: Number,
      default: 0,
    },
    options: [
      {
        name: String,
        choices: [
          {
            name: String,
            price: Number,
          },
        ],
        required: {
          type: Boolean,
          default: false,
        },
        multiple: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
