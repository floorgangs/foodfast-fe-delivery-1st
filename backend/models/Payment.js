import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    method: {
      type: String,
      enum: ["paypal"],
      required: true,
    },
    provider: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    rawData: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
