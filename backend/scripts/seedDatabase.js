import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Drone from "../models/Drone.js";
import Voucher from "../models/Voucher.js";
import Notification from "../models/Notification.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Place from "../models/Place.js";
import Delivery from "../models/Delivery.js";
import Payment from "../models/Payment.js";
import Location from "../models/Location.js";
import Note from "../models/Note.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ - FORCE DELETE
    console.log("🗑️  Clearing old data...");
    try {
      await User.deleteMany({});
      console.log("✅ Deleted all users (including old restaurants)");
    } catch (err) {
      console.log("⚠️ Error deleting users:", err.message);
    }

    try {
      await Product.deleteMany({});
      console.log("✅ Deleted all products");
    } catch (err) {
      console.log("⚠️ Error deleting products:", err.message);
    }

    try {
      await Order.deleteMany({});
      console.log("✅ Deleted all orders");
    } catch (err) {
      console.log("⚠️ Error deleting orders:", err.message);
    }

    try {
      await Drone.deleteMany({});
      console.log("✅ Deleted all drones");
    } catch (err) {
      console.log("⚠️ Error deleting drones:", err.message);
    }

    try {
      await Voucher.deleteMany({});
      console.log("✅ Deleted all vouchers");
    } catch (err) {
      console.log("⚠️ Error deleting vouchers:", err.message);
    }

    try {
      await Notification.deleteMany({});
      console.log("✅ Deleted all notifications");
    } catch (err) {
      console.log("⚠️ Error deleting notifications:", err.message);
    }

    try {
      await Cart.deleteMany({});
      console.log("✅ Deleted all carts");
    } catch (err) {
      console.log("⚠️ Error deleting carts:", err.message);
    }

    try {
      await CartItem.deleteMany({});
      console.log("✅ Deleted all cart items");
    } catch (err) {
      console.log("⚠️ Error deleting cart items:", err.message);
    }

    try {
      await Place.deleteMany({});
      console.log("✅ Deleted all places");
    } catch (err) {
      console.log("⚠️ Error deleting places:", err.message);
    }

    try {
      await Delivery.deleteMany({});
      console.log("✅ Deleted all deliveries");
    } catch (err) {
      console.log("⚠️ Error deleting deliveries:", err.message);
    }

    try {
      await Payment.deleteMany({});
      console.log("✅ Deleted all payments");
    } catch (err) {
      console.log("⚠️ Error deleting payments:", err.message);
    }

    try {
      await Location.deleteMany({});
      console.log("✅ Deleted all locations");
    } catch (err) {
      console.log("⚠️ Error deleting locations:", err.message);
    }

    try {
      await Note.deleteMany({});
      console.log("✅ Deleted all notes");
    } catch (err) {
      console.log("⚠️ Error deleting notes:", err.message);
    }

    console.log("✅ All old data cleared");

    // Tạo ALL users (admin, customers, restaurants) trong 1 collection
    console.log("👥 Creating all users (admin, customers, restaurants)...");

    const allUsers = await User.create([
      // Admin
      {
        name: "Admin User",
        email: "admin@foodfast.com",
        phone: "0901234567",
        password: "123456",
        role: "admin",
      },
      // Restaurant Owners (Users with role="restaurant")
      {
        name: "Nguyễn Văn Phở",
        email: "phoviet@restaurant.com",
        phone: "0902345678",
        password: hashedPassword,
        role: "restaurant",
      },
      {
        name: "Trần Thị Hải Sản",
        email: "lauhaisan@restaurant.com",
        phone: "0903456789",
        password: hashedPassword,
        role: "restaurant",
      },
      {
        name: "Lê Văn Cơm",
        email: "comtam@restaurant.com",
        phone: "0904567890",
        password: hashedPassword,
        role: "restaurant",
      },
      // Customers
      {
        name: "Nguyễn Văn A",
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
        name: "Trần Thị B",
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
      // Restaurants (role: "restaurant")
      {
        name: "Phở Việt Truyền Thống",
        email: "phoviet@restaurant.com",
        phone: "0902345678",
        password: "123456",
        role: "restaurant",
        avatar:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
      },
      {
        name: "Lẩu Hải Sản Ngon",
        email: "lauhaisan@restaurant.com",
        phone: "0903456789",
        password: "123456",
        role: "restaurant",
        avatar:
          "https://images.unsplash.com/photo-1582270691936-82d7c86d9e38?w=400",
        name: "Cơm Tấm Sườn Bì Chả",
        email: "comtam@restaurant.com",
        phone: "0904567890",
        password: "123456",
        role: "restaurant",
        avatar:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
      },
    ]);

    console.log(`✅ Created ${allUsers.length} users total`);
    console.log(
      `   - Admin: ${allUsers.filter((u) => u.role === "admin").length}`
    );
    console.log(
      `   - Customers: ${allUsers.filter((u) => u.role === "customer").length}`
    );
    console.log(
      `   - Restaurants: ${
        allUsers.filter((u) => u.role === "restaurant").length
      }`
    );

    // Get restaurant owner users
    const restaurantOwners = allUsers.filter((u) => u.role === "restaurant");

    // Create Restaurant documents (separate from User)
    console.log("🏪 Creating restaurant info documents...");
    const restaurants = await Restaurant.create([
      {
        owner: restaurantOwners[0]._id,
        name: "Nhà Hàng Phở Việt",
        description: "Phở bò truyền thống Hà Nội, nước dùng ngọt thanh từ xương hầm 24 giờ",
        cuisine: ["Việt Nam", "Phở", "Món nóng"],
        avatar: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        coverImage: "https://images.unsplash.com/photo-1547928576-664d7b4c7f0a?w=800",
        address: {
          street: "12 Lý Quốc Sư",
          city: "Hà Nội",
          district: "Hoàn Kiếm",
          ward: "Phường Hàng Trống",
        },
        phone: "0902345678",
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
        isActive: true,
        isApproved: true,
        tags: ["Phổ biến", "Giao nhanh", "Đặt trước"],
      },
      {
        owner: restaurantOwners[1]._id,
        name: "Lẩu Hải Sản Ngon",
        description: "Lẩu hải sản tươi sống, nước lẩu đậm đà từ tôm càng, cua biển",
        cuisine: ["Hải sản", "Lẩu", "Nhà hàng"],
        avatar: "https://images.unsplash.com/photo-1582270691936-82d7c86d9e38?w=400",
        coverImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
        address: {
          street: "89 Đinh Tiên Hoàng",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          ward: "Phường Đa Kao",
        },
        phone: "0903456789",
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
        owner: restaurantOwners[2]._id,
        name: "Cơm Tấm Sườn Bì Chả",
        description: "Cơm tấm sườn nướng thơm lừng, bì giòn, chả trứng mềm",
        cuisine: ["Việt Nam", "Cơm", "Đồ nướng"],
        avatar: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        coverImage: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
        address: {
          street: "234 Trần Hưng Đạo",
          city: "Hồ Chí Minh",
          district: "Quận 5",
          ward: "Phường 10",
        },
        phone: "0904567890",
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
    console.log(`✅ Created ${restaurants.length} restaurant info documents`);

    // Link restaurant back to user
    for (let i = 0; i < restaurantOwners.length; i++) {
      await User.findByIdAndUpdate(restaurantOwners[i]._id, {
        restaurant: restaurants[i]._id,
      });
    }

    // Tạo products
    console.log("🍜 Creating products...");
    const products = await Product.create([
      // Phở Việt
      {
        restaurant: restaurants[0]._id,
        name: "Phở Bò Tái",
        description: "Phở bò tái mềm, nước dùng trong, thơm",
        category: "Phở",
        price: 55000,
        image:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80&fit=crop",
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
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&fit=crop",
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
          "https://images.unsplash.com/photo-1547928576-664d7b4c7f0a?w=800&q=80&fit=crop",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 32,
        soldCount: 145,
      },
      // Lẩu Hải Sản
      {
        restaurant: restaurants[1]._id,
        name: "Lẩu Hải Sản Đặc Biệt",
        description: "Tôm càng, cua biển, mực, nghêu, sò điệp",
        category: "Lẩu",
        price: 450000,
        image:
          "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&fit=crop",
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
        name: "Drone Phở Việt 1",
        model: "DJI Delivery Pro",
        restaurant: restaurants[0]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: {
          lat: 21.0285,
          lng: 105.8542,
        },
        currentLocation: {
          lat: 21.0285,
          lng: 105.8542,
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
        name: "Drone Phở Việt 2",
        model: "DJI Delivery Pro",
        restaurant: restaurants[0]._id,
        status: "available",
        batteryLevel: 85,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: {
          lat: 21.0285,
          lng: 105.8542,
        },
        currentLocation: {
          lat: 21.0285,
          lng: 105.8542,
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
        createdBy: allUsers[0]._id,
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
        createdBy: allUsers[0]._id,
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
        validFrom: new Date("2024-12-01"),
        validUntil: new Date("2024-12-31"),
        isActive: true,
        createdBy: allUsers[0]._id,
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
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        isActive: true,
        createdBy: allUsers[0]._id,
      },
    ]);

    console.log(`✅ Created ${vouchers.length} vouchers`);

    // Tạo Carts cho customers
    console.log("🛒 Creating carts...");
    const customers = allUsers.filter((u) => u.role === "customer");
    const carts = await Cart.create(
      customers.map((customer) => ({
        userId: customer._id,
        cartItems: [],
        totalAmount: 0,
      }))
    );
    console.log(`✅ Created ${carts.length} carts`);

    // Tạo CartItems (thêm 1 món vào cart của customer 1)
    console.log("🛍️  Creating cart items...");
    const cartItems = await CartItem.create([
      {
        cartId: carts[0]._id,
        itemId: products[0]._id, // Phở Bò Tái
        quantity: 2,
        note: "Ít hành",
      },
      {
        cartId: carts[0]._id,
        itemId: products[1]._id, // Phở Gà
        quantity: 1,
      },
    ]);

    // Update cart với cartItems
    await Cart.findByIdAndUpdate(carts[0]._id, {
      cartItems: cartItems.map((item) => item._id),
      totalAmount: products[0].price * 2 + products[1].price,
    });
    console.log(`✅ Created ${cartItems.length} cart items`);

    // Tạo Places (liên kết giữa shop, user, order)
    console.log("📍 Creating places...");
    const places = await Place.create([
      {
        shopId: restaurants[0]._id,
        userId: customers[0]._id,
      },
      {
        shopId: restaurants[1]._id,
        userId: customers[1]._id,
      },
    ]);
    console.log(`✅ Created ${places.length} places`);

    // Tạo Deliveries (giao hàng cho orders)
    console.log("🚚 Creating deliveries...");
    const deliveries = await Delivery.create([
      {
        deliveryId: "DEL-001",
        orderId: new mongoose.Types.ObjectId(), // Placeholder - sẽ update khi có order thật
        droneId: drones[0]._id,
        startLocation: {
          coordinates: [105.8342, 21.0278], // Hà Nội
          address: "12 Lý Quốc Sư, Hoàn Kiếm, Hà Nội",
        },
        endLocation: {
          coordinates: [105.8412, 21.0245], // Customer location
          address: "123 Nguyễn Huệ, Quận 1, HCM",
        },
        status: "delivered",
        deliveredAt: new Date("2024-11-20T12:30:00"),
      },
      {
        deliveryId: "DEL-002",
        orderId: new mongoose.Types.ObjectId(),
        droneId: drones[2]._id,
        startLocation: {
          coordinates: [106.7009, 10.7769], // HCM
          address: "89 Đinh Tiên Hoàng, Quận 1, HCM",
        },
        endLocation: {
          coordinates: [106.7089, 10.7751],
          address: "456 Lê Lợi, Quận 1, HCM",
        },
        status: "in_transit",
      },
    ]);
    console.log(`✅ Created ${deliveries.length} deliveries`);

    // Tạo Payments
    console.log("💳 Creating payments...");
    const payments = await Payment.create([
      {
        paymentId: "PAY-001",
        orderId: new mongoose.Types.ObjectId(),
        contentId: "FOODFAST-ORD-001",
        methods: "VNPay",
        status: "completed",
      },
      {
        paymentId: "PAY-002",
        orderId: new mongoose.Types.ObjectId(),
        contentId: "FOODFAST-ORD-002",
        methods: "COD",
        status: "pending",
      },
    ]);
    console.log(`✅ Created ${payments.length} payments`);

    // Tạo Locations (tracking drone)
    console.log("🗺️  Creating location tracking...");
    const locations = await Location.create([
      {
        locationId: "LOC-001",
        droneId: drones[0]._id,
        longitude: 105.8342,
        latitude: 21.0278,
        altitude: 50,
        recordedAt: new Date("2024-11-20T12:00:00"),
      },
      {
        locationId: "LOC-002",
        droneId: drones[0]._id,
        longitude: 105.8377,
        latitude: 21.0261,
        altitude: 45,
        recordedAt: new Date("2024-11-20T12:15:00"),
      },
      {
        locationId: "LOC-003",
        droneId: drones[2]._id,
        longitude: 106.7009,
        latitude: 10.7769,
        altitude: 60,
        recordedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${locations.length} location records`);

    // Tạo Notes
    console.log("📝 Creating notes...");
    const notes = await Note.create([
      {
        content: "Giao hàng trước 12h trưa nhé",
        userId: customers[0]._id,
        orderId: new mongoose.Types.ObjectId(),
      },
      {
        content: "Không hành, nhiều rau",
        userId: customers[0]._id,
        cartItemId: cartItems[0]._id,
      },
      {
        content: "Khách yêu cầu đóng gói kỹ",
        orderId: new mongoose.Types.ObjectId(),
      },
    ]);
    console.log(`✅ Created ${notes.length} notes`);

    console.log("\n🎉 Seed data completed successfully!");
    console.log("📝 Test accounts:");
    console.log("   Admin: admin@foodfast.com / 123456");
    console.log("   Restaurant 1 (Phở Việt): nhahang@gmail.com / 123456");
    console.log("   Restaurant 2: lauhaisan@restaurant.com / 123456");
    console.log("   Restaurant 3: comtam@restaurant.com / 123456");
    console.log("   Customer 1: customer1@gmail.com / 123456");
    console.log("   Customer 2: customer2@gmail.com / 123456");
    console.log("\n🚁 Drones: 5 drones (2 Phở Việt, 1 Lẩu, 2 Cơm Tấm)");
    console.log(
      "🎟️  Vouchers: 4 vouchers (WELCOME50, FREEDEL, FLASH30, SAVE50K)"
    );
    console.log(`\n🛒 Carts: ${carts.length} carts`);
    console.log(`🛍️  Cart Items: ${cartItems.length} items`);
    console.log(`📍 Places: ${places.length} places`);
    console.log(`🚚 Deliveries: ${deliveries.length} deliveries`);
    console.log(`💳 Payments: ${payments.length} payments`);
    console.log(`🗺️  Locations: ${locations.length} location records`);
    console.log(`📝 Notes: ${notes.length} notes`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
