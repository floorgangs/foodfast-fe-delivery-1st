import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ["customer", "restaurant", "admin"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_order",
        "order_confirmed",
        "order_preparing",
        "order_ready",
        "drone_assigned",
        "drone_launched",
        "order_delivering",
        "order_delivered",
        "order_cancelled",
        "drone_maintenance",
        "payment_received",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    relatedDrone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
