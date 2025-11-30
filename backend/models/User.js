import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "restaurant", "staff"],
      default: "customer",
    },
    // Restaurant user sẽ có reference đến restaurant info
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?background=random",
    },
    // Staff-specific fields
    position: {
      type: String,
      enum: ["Quản lý", "Thu ngân", "Đầu bếp", "Phụ bếp", "Phục vụ", "Giao hàng"],
    },
    salary: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    idCard: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    emergencyContact: {
      type: String,
    },
    workSchedule: {
      type: String,
      enum: ["Ca sáng", "Ca chiều", "Full time"],
    },
    address: {
      type: String,
    },
    addresses: [
      {
        label: String,
        contactName: String,
        contactPhone: String,
        address: String,
        city: String,
        district: String,
        ward: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Customer-specific fields
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    usedVouchers: [
      {
        voucher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Voucher",
        },
        usedCount: {
          type: Number,
          default: 1,
        },
        lastUsed: Date,
      },
    ],
    loyaltyPoints: {
      type: Number,
      default: 0,
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

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
