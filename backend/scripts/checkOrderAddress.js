import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const checkOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find order FD1763
    const order = await Order.findOne({ orderNumber: /FD1763/ }).populate('restaurant', 'name address');

    if (!order) {
      console.log("❌ Order FD1763 not found");
      process.exit(0);
    }

    console.log(`\n📦 Order: ${order.orderNumber}`);
    console.log(`\n🏪 Restaurant:`, order.restaurant?.name);
    console.log(`Restaurant Address:`, order.restaurant?.address);
    
    console.log(`\n📍 Delivery Address stored in DB:`);
    console.log(JSON.stringify(order.deliveryAddress, null, 2));

    console.log(`\n📊 Customer Type:`, order.customerType);
    if (order.guestCustomer) {
      console.log(`Guest Info:`, order.guestCustomer);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkOrder();
