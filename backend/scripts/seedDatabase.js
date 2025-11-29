import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Drone from "../models/Drone.js";
import Voucher from "../models/Voucher.js";
import Notification from "../models/Notification.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ (nếu có quyền)
    try {
      console.log("🗑️  Clearing old data...");
      await User.deleteMany({});
      await Restaurant.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
      await Drone.deleteMany({});
      await Voucher.deleteMany({});
      await Notification.deleteMany({});
      console.log("✅ Old data cleared");
    } catch (error) {
      console.log("⚠️  Cannot clear old data (checking if data exists)...");
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log("ℹ️  Data already exists. Skipping seed...");
        console.log(
          "💡 To reseed, please delete data manually in MongoDB Compass or grant write permissions."
        );
        process.exit(0);
      }
    }

    // Tạo users
    console.log("👥 Creating users...");
    // Không hash ở đây, để User model tự hash trong pre('save') hook

    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@foodfast.com",
        phone: "0901234567",
        password: "123456",
        role: "admin",
      },
      {
        name: "Quán Gà Rán Giòn",
        email: "garan@restaurant.com",
        phone: "0902345678",
        password: "123456",
        role: "restaurant",
      },
      {
        name: "Nhà hàng Lẩu Hải Sản",
        email: "lauhaisan@restaurant.com",
        phone: "0903456789",
        password: "123456",
        role: "restaurant",
      },
      {
        name: "Quán Cơm Tấm Sườn",
        email: "comtam@restaurant.com",
        phone: "0904567890",
        password: "123456",
        role: "restaurant",
      },
      {
        name: "Khách hàng 1",
        email: "customer1@gmail.com",
        phone: "0905678901",
        password: "123456",
        role: "customer",
        addresses: [
          {
            label: "Nhà",
            address: "123 Nguyễn Huệ",
            city: "Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            isDefault: true,
          },
        ],
      },
      {
        name: "Khách hàng 2",
        email: "customer2@gmail.com",
        phone: "0906789012",
        password: "123456",
        role: "customer",
        addresses: [
          {
            label: "Công ty",
            address: "456 Lê Lợi",
            city: "Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Thành",
            isDefault: true,
          },
        ],
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Tạo restaurants
    console.log("🏪 Creating restaurants...");
    const restaurants = await Restaurant.create([
      {
        name: "Gà Rán Giòn Tan",
        owner: users[1]._id,
        description:
          "Gà rán giòn rụm, khoai tây chiên ngon, burger đậm đà",
        cuisine: ["Fastfood", "Gà rán", "Burger"],
        avatar:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        coverImage:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
        address: {
          street: "321 Điện Biên Phủ",
          city: "Hồ Chí Minh",
          district: "Quận Bình Thạnh",
          ward: "Phường 25",
        },
        phone: "0902345678",
        email: "garan@restaurant.com",
        openingHours: {
          monday: { open: "09:00", close: "22:00", isOpen: true },
          tuesday: { open: "09:00", close: "22:00", isOpen: true },
          wednesday: { open: "09:00", close: "22:00", isOpen: true },
          thursday: { open: "09:00", close: "22:00", isOpen: true },
          friday: { open: "09:00", close: "23:00", isOpen: true },
          saturday: { open: "09:00", close: "23:00", isOpen: true },
          sunday: { open: "09:00", close: "22:00", isOpen: true },
        },
        rating: 4.5,
        totalReviews: 234,
        deliveryFee: 15000,
        minOrder: 50000,
        estimatedDeliveryTime: "15-25 phút",
        isActive: true,
        isApproved: true,
        tags: ["Phổ biến", "Fastfood", "Giao nhanh"],
      },
      {
        name: "Lẩu Hải Sản Ngon",
        owner: users[2]._id,
        description:
          "Lẩu hải sản tươi sống, nước lẩu đậm đà từ tôm càng, cua biển",
        cuisine: ["Hải sản", "Lẩu", "Nhà hàng"],
        avatar:
          "https://images.unsplash.com/photo-1582270691936-82d7c86d9e38?w=400",
        coverImage:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
        address: {
          street: "89 Đinh Tiên Hoàng",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          ward: "Phường Đa Kao",
        },
        phone: "0903456789",
        email: "lauhaisan@restaurant.com",
        openingHours: {
          monday: { open: "10:00", close: "22:00", isOpen: true },
          tuesday: { open: "10:00", close: "22:00", isOpen: true },
          wednesday: { open: "10:00", close: "22:00", isOpen: true },
          thursday: { open: "10:00", close: "22:00", isOpen: true },
          friday: { open: "10:00", close: "23:00", isOpen: true },
          saturday: { open: "10:00", close: "23:00", isOpen: true },
          sunday: { open: "10:00", close: "23:00", isOpen: true },
        },
        rating: 4.6,
        totalReviews: 89,
        deliveryFee: 20000,
        minOrder: 100000,
        estimatedDeliveryTime: "35-45 phút",
        isActive: true,
        isApproved: true,
        tags: ["Cao cấp", "Hải sản tươi"],
      },
      {
        name: "Cơm Tấm Sườn Bì Chả",
        owner: users[3]._id,
        description: "Cơm tấm sườn nướng thơm lừng, bì giòn, chả trứng mềm",
        cuisine: ["Việt Nam", "Cơm", "Đồ nướng"],
        avatar:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        coverImage:
          "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
        address: {
          street: "234 Trần Hưng Đạo",
          city: "Hồ Chí Minh",
          district: "Quận 5",
          ward: "Phường 10",
        },
        phone: "0904567890",
        email: "comtam@restaurant.com",
        openingHours: {
          monday: { open: "06:00", close: "21:00", isOpen: true },
          tuesday: { open: "06:00", close: "21:00", isOpen: true },
          wednesday: { open: "06:00", close: "21:00", isOpen: true },
          thursday: { open: "06:00", close: "21:00", isOpen: true },
          friday: { open: "06:00", close: "21:00", isOpen: true },
          saturday: { open: "06:00", close: "21:00", isOpen: true },
          sunday: { open: "06:00", close: "21:00", isOpen: true },
        },
        rating: 4.7,
        totalReviews: 234,
        deliveryFee: 12000,
        minOrder: 40000,
        estimatedDeliveryTime: "20-30 phút",
        isActive: true,
        isApproved: true,
        tags: ["Bán chạy", "Giá rẻ", "Giao nhanh"],
      },
    ]);

    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Tạo products
    console.log("🍜 Creating products...");
    const products = await Product.create([
      // Gà Rán
      {
        restaurant: restaurants[0]._id,
        name: "Gà Rán 3 Miếng",
        description: "Gà rán giòn 3 miếng + khoai tây chiên",
        category: "Gà rán",
        price: 95000,
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 234,
        soldCount: 456,
        tags: ["Bán chạy", "Combo"],
      },
      {
        restaurant: restaurants[0]._id,
        name: "Combo Gà + Khoai",
        description: "Gà rán + khoai tây chiên + pepsi",
        category: "Combo",
        price: 75000,
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
        isAvailable: true,
        rating: 4.4,
        totalReviews: 189,
        soldCount: 321,
      },
      {
        restaurant: restaurants[0]._id,
        name: "Burger Gà Giòn",
        description: "Burger gà giòn + rau xà lách + sốt",
        category: "Burger",
        price: 55000,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        isAvailable: true,
        rating: 4.3,
        totalReviews: 145,
        soldCount: 267,
      },
      // Lẩu Hải Sản
      {
        restaurant: restaurants[1]._id,
        name: "Lẩu Hải Sản Đặc Biệt",
        description: "Tôm càng, cua biển, mực, nghêu, sò điệp",
        category: "Lẩu",
        price: 450000,
        image:
          "https://images.unsplash.com/photo-1582270691936-82d7c86d9e38?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 67,
        soldCount: 456,
        tags: ["Cao cấp", "Đặc biệt"],
      },
      {
        restaurant: restaurants[1]._id,
        name: "Lẩu Tôm Càng",
        description: "Tôm càng tươi sống, nước lẩu ngọt thanh",
        category: "Lẩu",
        price: 350000,
        image:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 54,
        soldCount: 321,
      },
      // Cơm Tấm
      {
        restaurant: restaurants[2]._id,
        name: "Cơm Tấm Sườn Bì Chả",
        description: "Combo đầy đủ sườn bì chả trứng",
        category: "Cơm",
        price: 45000,
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 156,
        soldCount: 789,
        tags: ["Bán chạy", "Combo"],
      },
      {
        restaurant: restaurants[2]._id,
        name: "Cơm Tấm Sườn Nướng",
        description: "Sườn nướng thơm lừng",
        category: "Cơm",
        price: 40000,
        image:
          "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 123,
        soldCount: 567,
      },
      {
        restaurant: restaurants[2]._id,
        name: "Cơm Tấm Gà Nướng",
        description: "Gà nướng mật ong thơm ngon",
        category: "Cơm",
        price: 38000,
        image:
          "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 98,
        soldCount: 434,
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Tạo drones
    console.log("🚁 Creating drones...");
    const drones = await Drone.create([
      {
        droneId: "DRONE001",
        name: "Drone Gà Rán 1",
        model: "DJI Delivery Pro",
        restaurant: restaurants[0]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: {
          lat: 10.8082,
          lng: 106.7099,
        },
        currentLocation: {
          lat: 10.8082,
          lng: 106.7099,
        },
        specifications: {
          flightTime: 35,
          speed: 45,
          manufacturer: "DJI",
          purchaseDate: new Date("2024-01-15"),
        },
      },
      {
        droneId: "DRONE002",
        name: "Drone Gà Rán 2",
        model: "DJI Delivery Pro",
        restaurant: restaurants[0]._id,
        status: "available",
        batteryLevel: 85,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: {
          lat: 10.8082,
          lng: 106.7099,
        },
        currentLocation: {
          lat: 10.8082,
          lng: 106.7099,
        },
        specifications: {
          flightTime: 35,
          speed: 45,
          manufacturer: "DJI",
          purchaseDate: new Date("2024-02-20"),
        },
      },
      {
        droneId: "DRONE003",
        name: "Drone Lẩu Hải Sản 1",
        model: "Zipline Max",
        restaurant: restaurants[1]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 7000,
        maxDistance: 15000,
        homeLocation: {
          lat: 10.7769,
          lng: 106.7009,
        },
        currentLocation: {
          lat: 10.7769,
          lng: 106.7009,
        },
        specifications: {
          flightTime: 45,
          speed: 55,
          manufacturer: "Zipline",
          purchaseDate: new Date("2024-03-10"),
        },
      },
      {
        droneId: "DRONE004",
        name: "Drone Cơm Tấm 1",
        model: "Wing Mini",
        restaurant: restaurants[2]._id,
        status: "available",
        batteryLevel: 95,
        maxWeight: 3000,
        maxDistance: 8000,
        homeLocation: {
          lat: 10.7548,
          lng: 106.6665,
        },
        currentLocation: {
          lat: 10.7548,
          lng: 106.6665,
        },
        specifications: {
          flightTime: 25,
          speed: 40,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-04-05"),
        },
      },
      {
        droneId: "DRONE005",
        name: "Drone Cơm Tấm 2",
        model: "Wing Mini",
        restaurant: restaurants[2]._id,
        status: "charging",
        batteryLevel: 45,
        maxWeight: 3000,
        maxDistance: 8000,
        homeLocation: {
          lat: 10.7548,
          lng: 106.6665,
        },
        currentLocation: {
          lat: 10.7548,
          lng: 106.6665,
        },
        specifications: {
          flightTime: 25,
          speed: 40,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-04-05"),
        },
      },
    ]);

    console.log(`✅ Created ${drones.length} drones`);

    // Tạo vouchers
    console.log("🎟️  Creating vouchers...");
    const vouchers = await Voucher.create([
      {
        code: "WELCOME50",
        name: "Chào mừng thành viên mới",
        description: "Giảm 50% tối đa 50k cho đơn hàng đầu tiên",
        type: "percentage",
        value: 50,
        maxDiscount: 50000,
        minOrderValue: 100000,
        maxUsage: 1000,
        maxUsagePerUser: 1,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "FREEDEL",
        name: "Miễn phí giao hàng",
        description: "Miễn phí giao hàng cho đơn từ 150k",
        type: "free_delivery",
        value: 0,
        minOrderValue: 150000,
        maxUsage: null,
        maxUsagePerUser: 5,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "FLASH30",
        name: "Flash Sale 30%",
        description: "Giảm 30% tối đa 100k",
        type: "percentage",
        value: 30,
        maxDiscount: 100000,
        minOrderValue: 200000,
        maxUsage: 500,
        maxUsagePerUser: 2,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2024-12-31"),
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "SAVE50K",
        name: "Giảm 50k",
        description: "Giảm 50k cho đơn từ 300k",
        type: "fixed",
        value: 50000,
        minOrderValue: 300000,
        maxUsage: 200,
        maxUsagePerUser: 1,
        applicableRestaurants: [restaurants[0]._id, restaurants[1]._id],
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2024-12-31"),
        isActive: true,
        createdBy: users[0]._id,
      },
    ]);

    console.log(`✅ Created ${vouchers.length} vouchers`);

    console.log("\n🎉 Seed data completed successfully!");
    console.log("\n📝 Test accounts:");
    console.log("   Admin: admin@foodfast.com / 123456");
    console.log("   Restaurant 1: garan@restaurant.com / 123456");
    console.log("   Restaurant 2: lauhaisan@restaurant.com / 123456");
    console.log("   Restaurant 3: comtam@restaurant.com / 123456");
    console.log("   Customer 1: customer1@gmail.com / 123456");
    console.log("   Customer 2: customer2@gmail.com / 123456");
    console.log("\n🚁 Drones: 5 drones (2 Gà Rán, 1 Lẩu, 2 Cơm Tấm)");
    console.log(
      "🎟️  Vouchers: 4 vouchers (WELCOME50, FREEDEL, FLASH30, SAVE50K)"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
