import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: true,
      unique: true,
    },
    droneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      default: 0,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
locationSchema.index({ longitude: 1, latitude: 1 });

export default mongoose.model("Location", locationSchema);
