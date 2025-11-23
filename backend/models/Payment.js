import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      default: () => `PAYMENT-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
    },
    method: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    rawData: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
