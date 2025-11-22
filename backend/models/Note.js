import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    cartItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItem",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Note", noteSchema);
