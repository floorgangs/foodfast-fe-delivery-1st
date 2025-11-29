import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên nhân viên"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["Quản lý", "Thu ngân", "Đầu bếp", "Phục vụ", "Giao hàng"],
      default: "Phục vụ",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
staffSchema.index({ restaurant: 1, isActive: 1 });

export default mongoose.model("Staff", staffSchema);
