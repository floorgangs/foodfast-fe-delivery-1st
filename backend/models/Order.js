import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerType: {
      type: String,
      enum: ["registered", "guest"],
      default: "registered",
    },
    guestCustomer: {
      name: String,
      phone: String,
      email: String,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        options: [
          {
            name: String,
            choice: String,
            price: Number,
          },
        ],
        specialInstructions: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },
    discount: {
      type: Number,
      default: 0,
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
      note: String,
    },
    paymentMethod: {
      type: String,
      enum: [
        "cod",
        "cash",
        "momo",
        "vnpay",
        "zalopay",
        "card",
        "banking",
        "dronepay",
      ],
      required: true,
    },
    paymentProvider: {
      type: String,
    },
    paymentSessionId: {
      type: String,
    },
    paymentSessionExpiresAt: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentTransaction: {
      transactionId: String,
      paidAt: Date,
      amount: Number,
      method: String,
      provider: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready",
        "delivering",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    cancelReason: String,
    customerNote: String,
    restaurantNote: String,
    drone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
    },
    assignedDrone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
    },
    droneDeliveryDetails: {
      assignedAt: Date,
      launchedAt: Date,
      arrivedAt: Date,
      returnedAt: Date,
      flightDistance: Number, // km
      flightDuration: Number, // phút
      batteryUsed: Number, // %
      currentLocation: {
        lat: Number,
        lng: Number,
        heading: Number,
        updatedAt: Date,
      },
    },
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    isReviewed: {
      type: Boolean,
      default: false,
    },
    customerReview: {
      rating: Number,
      comment: String,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      images: [String],
      reviewedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động tạo orderNumber
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `FF${Date.now()}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
