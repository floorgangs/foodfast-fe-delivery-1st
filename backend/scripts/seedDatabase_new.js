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

    // Xóa dữ liệu cũ
    console.log("🗑️  Clearing old data...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Drone.deleteMany({});
    await Voucher.deleteMany({});
    await Notification.deleteMany({});
    console.log("✅ All old data cleared");

    // 1. Tạo Admin và Customers
    console.log("👥 Creating users (admin + customers)...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@foodfast.com",
        phone: "0901234567",
        password: "123456",
        role: "admin",
      },
      {
        name: "Nguyễn Văn A",
        email: "customer1@gmail.com",
        phone: "0905678901",
        password: "123456",
        role: "customer",
        addresses: [
          {
            label: "Nhà",
            address: "123 Nguyễn Huệ, Quận 1",
            city: "Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            isDefault: true,
          },
        ],
      },
      {
        name: "Trần Thị B",
        email: "customer2@gmail.com",
        phone: "0906789012",
        password: "123456",
        role: "customer",
        addresses: [
          {
            label: "Công ty",
            address: "456 Lê Lợi, Quận 1",
            city: "Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Bến Thành",
            isDefault: true,
          },
        ],
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // 2. Tạo Restaurants (gán owner = admin user)
    console.log("🏪 Creating restaurants...");
    const adminUser = users.find((u) => u.role === "admin");
    const restaurants = await Restaurant.create([
      {
        name: "Phở Việt Truyền Thống",
        email: "phoviet@restaurant.com",
        phone: "0902345678",
        password: "123456",
        owner: adminUser._id, // Admin quản lý nhà hàng này
        description:
          "Phở bò truyền thống Hà Nội, nước dùng ngọt thanh từ xương hầm 24 giờ",
        cuisine: ["Việt Nam", "Phở", "Món nóng"],
        avatar:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        coverImage:
          "https://images.unsplash.com/photo-1547928576-664d7b4c7f0a?w=800",
        address: {
          street: "12 Lý Quốc Sư",
          city: "Hà Nội",
          district: "Hoàn Kiếm",
          ward: "Phường Hàng Trống",
          coordinates: { lat: 21.0285, lng: 105.8542 },
        },
        openingHours: {
          monday: { open: "06:00", close: "22:00", isOpen: true },
          tuesday: { open: "06:00", close: "22:00", isOpen: true },
          wednesday: { open: "06:00", close: "22:00", isOpen: true },
          thursday: { open: "06:00", close: "22:00", isOpen: true },
          friday: { open: "06:00", close: "22:00", isOpen: true },
          saturday: { open: "06:00", close: "23:00", isOpen: true },
          sunday: { open: "06:00", close: "23:00", isOpen: true },
        },
        rating: 4.8,
        totalReviews: 156,
        deliveryFee: 15000,
        minOrder: 50000,
        estimatedDeliveryTime: "25-35 phút",
        isApproved: true,
        isBusy: false,
        tags: ["Phổ biến", "Giao nhanh", "Đặt trước"],
      },
      {
        name: "Lẩu Hải Sản Ngon",
        email: "lauhaisan@restaurant.com",
        phone: "0903456789",
        password: "123456",
        owner: adminUser._id,
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
          coordinates: { lat: 10.7769, lng: 106.7009 },
        },
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
        isApproved: true,
        isBusy: false,
        tags: ["Cao cấp", "Hải sản tươi"],
      },
      {
        name: "Cơm Tấm Sườn Bì Chả",
        email: "comtam@restaurant.com",
        phone: "0904567890",
        password: "123456",
        owner: adminUser._id,
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
          coordinates: { lat: 10.7546, lng: 106.6676 },
        },
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
        isApproved: true,
        isBusy: false,
        tags: ["Bán chạy", "Giá rẻ", "Giao nhanh"],
      },
    ]);
    console.log(`✅ Created ${restaurants.length} restaurants`);

    // 3. Tạo Products
    console.log("🍜 Creating products...");
    const products = await Product.create([
      // Phở Việt (restaurants[0])
      {
        restaurant: restaurants[0]._id,
        name: "Phở Bò Tái",
        description: "Phở bò tái mềm, nước dùng trong, thơm",
        category: "Phở",
        price: 55000,
        image:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 45,
        soldCount: 234,
        tags: ["Bán chạy", "Đặc sản"],
      },
      {
        restaurant: restaurants[0]._id,
        name: "Phở Bò Chín",
        description: "Phở bò chín mềm, ngon",
        category: "Phở",
        price: 55000,
        image:
          "https://images.unsplash.com/photo-1547928576-664d7b4c7f0a?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 38,
        soldCount: 189,
      },
      {
        restaurant: restaurants[0]._id,
        name: "Phở Gà",
        description: "Phở gà thơm ngon, nước trong",
        category: "Phở",
        price: 50000,
        image:
          "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 32,
        soldCount: 145,
      },
      // Lẩu Hải Sản (restaurants[1])
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
      // Cơm Tấm (restaurants[2])
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
        name: "Cơm Tấm Chả Cá",
        description: "Chả cá thơm ngon",
        category: "Cơm",
        price: 42000,
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 98,
        soldCount: 432,
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 4. Tạo Drones
    console.log("🚁 Creating drones...");
    const drones = await Drone.create([
      {
        droneId: "DRONE001",
        name: "Drone Alpha",
        model: "DJI Delivery Pro X1",
        restaurant: restaurants[0]._id, // Phở Việt
        status: "available",
        battery: 95,
        maxLoad: 5,
        currentLocation: {
          lat: 21.0285,
          lng: 105.8542,
        },
      },
      {
        droneId: "DRONE002",
        name: "Drone Beta",
        model: "DJI Delivery Pro X1",
        restaurant: restaurants[1]._id, // Lẩu Hải Sản
        status: "available",
        battery: 88,
        maxLoad: 5,
        currentLocation: {
          lat: 10.7769,
          lng: 106.7009,
        },
      },
      {
        droneId: "DRONE003",
        name: "Drone Gamma",
        model: "DJI Delivery Pro X2",
        restaurant: restaurants[2]._id, // Cơm Tấm
        status: "available",
        battery: 100,
        maxLoad: 8,
        currentLocation: {
          lat: 10.7546,
          lng: 106.6676,
        },
      },
    ]);
    console.log(`✅ Created ${drones.length} drones`);

    // 5. Tạo Vouchers
    console.log("🎟️  Creating vouchers...");
    const vouchers = await Voucher.create([
      {
        code: "WELCOME50",
        name: "Giảm 50k cho đơn đầu tiên",
        description: "Áp dụng cho khách hàng mới, đơn tối thiểu 100k",
        type: "fixed",
        value: 50000,
        minOrderValue: 100000,
        maxUsagePerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "FREESHIP",
        name: "Miễn phí vận chuyển",
        description: "Áp dụng cho đơn từ 200k",
        type: "free_delivery",
        value: 100,
        minOrderValue: 200000,
        maxUsagePerUser: 5,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${vouchers.length} vouchers`);

    console.log("\n✅ ========================================");
    console.log("✅ SEED DATABASE COMPLETED SUCCESSFULLY!");
    console.log("✅ ========================================\n");
    console.log("📊 Summary:");
    console.log(`   👤 Users: ${users.length} (1 admin, 2 customers)`);
    console.log(`   🏪 Restaurants: ${restaurants.length}`);
    console.log(`   🍜 Products: ${products.length}`);
    console.log(`   🚁 Drones: ${drones.length}`);
    console.log(`   🎟️  Vouchers: ${vouchers.length}`);
    console.log("\n🔑 Test Accounts:");
    console.log("   Admin: admin@foodfast.com / 123456");
    console.log("   Customer: customer1@gmail.com / 123456");
    console.log("   Restaurant: phoviet@restaurant.com / 123456");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
