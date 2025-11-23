import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const checkRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check Restaurant collection
    const restaurants = await Restaurant.find({}).populate(
      "owner",
      "name email role"
    );
    console.log(`🏪 Total Restaurants in DB: ${restaurants.length}\n`);

    if (restaurants.length > 0) {
      restaurants.forEach((restaurant, index) => {
        console.log(`${index + 1}. ${restaurant.name}`);
        console.log(`   ID: ${restaurant._id}`);
        console.log(
          `   Owner: ${restaurant.owner?.name} (${restaurant.owner?.email})`
        );
        console.log(`   Phone: ${restaurant.phone}`);
        console.log(
          `   Address: ${restaurant.address?.street}, ${restaurant.address?.city}`
        );
        console.log(`   Created: ${restaurant.createdAt?.toLocaleString()}`);
        console.log("");
      });
    } else {
      console.log("❌ NO RESTAURANTS FOUND IN DATABASE!\n");
    }

    // Check Users with role="restaurant"
    const restaurantUsers = await User.find({ role: "restaurant" });
    console.log(`👤 Users with role="restaurant": ${restaurantUsers.length}\n`);

    if (restaurantUsers.length > 0) {
      restaurantUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Restaurant field: ${user.restaurant || "NULL"}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkRestaurants();
