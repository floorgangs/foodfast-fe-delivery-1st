import mongoose from "mongoose";

const savedOrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: String,
  },
  { _id: false }
);

const savedOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    items: {
      type: [savedOrderItemSchema],
      required: true,
      validate: {
        validator: (items) => items && items.length > 0,
        message: "Đơn tạm phải có ít nhất 1 món",
      },
    },
    total: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      label: String,
      address: String,
      city: String,
      district: String,
      ward: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      phone: String,
    },
    note: String,
    voucherCode: String,
    discount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    // Metadata để user dễ nhận diện
    displayName: {
      type: String,
      default: function () {
        return `${this.restaurantName} - ${new Date().toLocaleDateString("vi-VN")}`;
      },
    },
    tags: [String], // ['yêu thích', 'đặt thường xuyên', 'cuối tuần']
    orderCount: {
      type: Number,
      default: 0, // Số lần đã đặt từ đơn này
    },
    lastOrderedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh
savedOrderSchema.index({ user: 1, createdAt: -1 });
savedOrderSchema.index({ user: 1, restaurant: 1 });

export default mongoose.model("SavedOrder", savedOrderSchema);
