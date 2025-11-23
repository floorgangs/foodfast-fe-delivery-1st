import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const updateOrderAddress = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find the most recent order
    const recentOrder = await Order.findOne().sort({ createdAt: -1 });

    if (!recentOrder) {
      console.log("❌ No orders found");
      process.exit(0);
    }

    console.log(`📦 Found order: ${recentOrder.orderNumber}`);
    console.log(`📍 Current address:`, recentOrder.deliveryAddress);

    // Parse address string to extract components
    const parseAddress = (addressStr) => {
      if (!addressStr) return null;
      
      const normalized = addressStr.toLowerCase();
      
      // Extract ward
      let ward = '';
      const wardMatch = normalized.match(/phường\s*(\d+|[\w\s]+?)(?=,|$)/i);
      if (wardMatch) {
        ward = `Phường ${wardMatch[1].trim()}`;
      }
      
      // Extract district
      let district = '';
      const districtPatterns = [
        /quận\s*(\d+|[\w\s]+?)(?=,|tp|hồ chí minh|$)/i,
        /huyện\s*([\w\s]+?)(?=,|tp|hồ chí minh|$)/i,
      ];
      
      for (const pattern of districtPatterns) {
        const match = normalized.match(pattern);
        if (match) {
          const value = match[1].trim();
          district = normalized.includes('huyện') ? `Huyện ${value}` : `Quận ${value}`;
          break;
        }
      }
      
      // Extract city
      let city = 'Hồ Chí Minh';
      if (/hồ chí minh|tp\.?hcm|sài gòn/i.test(normalized)) {
        city = 'Hồ Chí Minh';
      } else if (/hà nội/i.test(normalized)) {
        city = 'Hà Nội';
      }
      
      return { ward, district, city };
    };

    // Get full address string
    const fullAddress = recentOrder.deliveryAddress.address || 
                       recentOrder.deliveryAddress.street ||
                       [
                         recentOrder.deliveryAddress.street,
                         recentOrder.deliveryAddress.ward,
                         recentOrder.deliveryAddress.district,
                         recentOrder.deliveryAddress.city
                       ].filter(Boolean).join(', ');

    console.log(`\n📝 Full address string: ${fullAddress}`);

    const parsedComponents = parseAddress(fullAddress);
    console.log(`\n🔍 Parsed components:`, parsedComponents);

    // Update the order with proper components
    const updated = {
      ...recentOrder.deliveryAddress,
      ward: parsedComponents.ward || recentOrder.deliveryAddress.ward,
      district: parsedComponents.district || recentOrder.deliveryAddress.district,
      city: parsedComponents.city || recentOrder.deliveryAddress.city,
    };

    // Only update if we actually parsed something
    if (parsedComponents.ward || parsedComponents.district) {
      recentOrder.deliveryAddress = updated;
      await recentOrder.save();
      console.log(`\n✅ Updated order address:`, recentOrder.deliveryAddress);
    } else {
      console.log(`\n⚠️  Could not parse address components from: ${fullAddress}`);
      console.log(`Suggested: Create a new order with proper address format`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

updateOrderAddress();
