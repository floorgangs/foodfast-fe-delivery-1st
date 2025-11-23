import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import dotenv from "dotenv";

dotenv.config();

const updateRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Update all restaurants to be active and approved
    const result = await Restaurant.updateMany(
      {},
      {
        $set: {
          isActive: true,
          isApproved: true,
          isBusy: false,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} restaurants`);
    console.log("   - Set isActive = true");
    console.log("   - Set isApproved = true");
    console.log("   - Set isBusy = false\n");

    // Verify
    const restaurants = await Restaurant.find({});
    console.log("📋 Current status:");
    restaurants.forEach((r, i) => {
      console.log(
        `${i + 1}. ${r.name}: isActive=${r.isActive}, isApproved=${
          r.isApproved
        }, isBusy=${r.isBusy}`
      );
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updateRestaurants();
