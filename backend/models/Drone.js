import mongoose from "mongoose";

const droneSchema = new mongoose.Schema(
  {
    droneId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "available",
        "busy",
        "delivering",
        "returning",
        "charging",
        "maintenance",
        "offline",
      ],
      default: "available",
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    maxWeight: {
      type: Number,
      default: 5000, // grams
      required: true,
    },
    maxDistance: {
      type: Number,
      default: 10000, // meters
      required: true,
    },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    homeLocation: {
      lat: Number,
      lng: Number,
    },
    specifications: {
      flightTime: Number, // phút
      speed: Number, // km/h
      manufacturer: String,
      purchaseDate: Date,
    },
    statistics: {
      totalDeliveries: {
        type: Number,
        default: 0,
      },
      totalFlightTime: {
        type: Number,
        default: 0, // phút
      },
      totalDistance: {
        type: Number,
        default: 0, // km
      },
    },
    maintenanceHistory: [
      {
        date: Date,
        type: String,
        description: String,
        cost: Number,
        technician: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Drone", droneSchema);
