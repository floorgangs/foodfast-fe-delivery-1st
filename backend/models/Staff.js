import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["Quản lý", "Thu ngân", "Đầu bếp", "Phụ bếp", "Phục vụ", "Giao hàng"],
      default: "Phục vụ",
    },
    salary: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    idCard: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    workSchedule: {
      type: String,
      enum: ["Ca sáng", "Ca chiều", "Full time"],
      default: "Ca sáng",
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasAccount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
staffSchema.index({ restaurant: 1, isActive: 1 });
staffSchema.index({ user: 1 });

export default mongoose.model("Staff", staffSchema);
