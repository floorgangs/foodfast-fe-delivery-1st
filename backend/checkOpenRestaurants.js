import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check restaurants
    const restaurants = await Restaurant.find({});
    console.log(`🏪 Total Restaurants: ${restaurants.length}\n`);

    if (restaurants.length > 0) {
      restaurants.forEach((r, index) => {
        console.log(`${index + 1}. ${r.name}`);
        console.log(`   ID: ${r._id}`);
        console.log(
          `   Is Open: ${r.isOpen !== undefined ? r.isOpen : "NOT SET"}`
        );
        console.log(`   Status: ${r.status || "NOT SET"}`);
        console.log(`   Rating: ${r.rating || 0}`);
        console.log("");
      });

      // Check products for each restaurant
      console.log("\n📦 PRODUCTS BY RESTAURANT:\n");
      for (const r of restaurants) {
        const products = await Product.find({ restaurant: r._id });
        console.log(`${r.name}: ${products.length} products`);
        if (products.length > 0) {
          products.slice(0, 3).forEach((p) => {
            console.log(
              `   - ${p.name}: ${p.price.toLocaleString()}đ (Stock: ${
                p.stock || "unlimited"
              })`
            );
          });
        }
        console.log("");
      }
    } else {
      console.log("❌ NO RESTAURANTS IN DATABASE!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkData();
