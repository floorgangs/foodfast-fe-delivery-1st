import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";
import Drone from "../models/Drone.js";
import Voucher from "../models/Voucher.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

dotenv.config();

const seedExtendedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ
    console.log("🗑️  Clearing old data...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Product.deleteMany({});
    await Drone.deleteMany({});
    await Voucher.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log("✅ Old data cleared");

    // Tạo users
    console.log("👥 Creating users...");
    // Không hash password ở đây vì User model sẽ tự động hash trong pre-save hook
    const plainPassword = "123456";

    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@foodfast.com",
        phone: "0901234567",
        password: plainPassword,
        role: "admin",
      },
      // Restaurant owners (3 owners for 3 restaurants)
      {
        name: "Chủ Phở Việt",
        email: "phoviet@restaurant.com",
        phone: "0902345678",
        password: plainPassword,
        role: "restaurant",
      },
      {
        name: "Chủ Cơm Tấm",
        email: "comtam@restaurant.com",
        phone: "0902345680",
        password: plainPassword,
        role: "restaurant",
      },
      {
        name: "Chủ Lẩu Hải Sản",
        email: "lauhaisan@restaurant.com",
        phone: "0902345681",
        password: plainPassword,
        role: "restaurant",
      },
      // Customers
      {
        name: "Nguyễn Văn A",
        email: "customer1@gmail.com",
        phone: "0905678901",
        password: plainPassword,
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
          {
            label: "Công ty",
            address: "456 Lê Lợi",
            city: "Hồ Chí Minh",
            district: "Quận 3",
            ward: "Phường 7",
            isDefault: false,
          },
        ],
      },
      {
        name: "Trần Thị B",
        email: "customer2@gmail.com",
        phone: "0906789012",
        password: plainPassword,
        role: "customer",
        addresses: [
          {
            label: "Nhà riêng",
            address: "789 Trần Hưng Đạo",
            city: "Hồ Chí Minh",
            district: "Quận 5",
            ward: "Phường 10",
            isDefault: true,
          },
        ],
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Tạo 3 restaurants
    console.log("🏪 Creating restaurants...");
    const restaurants = await Restaurant.create([
      {
        name: "Phở Hà Nội",
        owner: users[1]._id,
        description: "Phở truyền thống Hà Nội, nước dùng ninh từ xương bò 24h",
        cuisine: ["Việt Nam", "Phở", "Món nóng"],
        avatar: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        coverImage: "https://images.unsplash.com/photo-1547928576-664d7b4c7f0a?w=800",
        address: {
          street: "123 Nguyễn Huệ",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          ward: "Phường Bến Nghé",
        },
        phone: "0902345678",
        email: "phoviet@restaurant.com",
        openingHours: {
          monday: { open: "06:00", close: "22:00", isOpen: true },
          tuesday: { open: "06:00", close: "22:00", isOpen: true },
          wednesday: { open: "06:00", close: "22:00", isOpen: true },
          thursday: { open: "06:00", close: "22:00", isOpen: true },
          friday: { open: "06:00", close: "22:00", isOpen: true },
          saturday: { open: "06:00", close: "23:00", isOpen: true },
          sunday: { open: "06:00", close: "23:00", isOpen: true },
        },
        rating: 4.5,
        totalReviews: 150,
        deliveryFee: 15000,
        minOrder: 50000,
        estimatedDeliveryTime: "15-25 phút",
        isActive: true,
        isApproved: true,
        tags: ["Phổ biến", "Giao nhanh"],
      },
      {
        name: "Cơm Tấm Sài Gòn",
        owner: users[2]._id,
        description: "Cơm tấm sườn bì chả truyền thống Sài Gòn",
        cuisine: ["Việt Nam", "Cơm", "Đồ nướng"],
        avatar: "https://images.unsplash.com/photo-1543353071-087092ec393a?w=400",
        coverImage: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
        address: {
          street: "789 Trần Hưng Đạo",
          city: "Hồ Chí Minh",
          district: "Quận 5",
          ward: "Phường 10",
        },
        phone: "0902345680",
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
        rating: 4.6,
        totalReviews: 280,
        deliveryFee: 12000,
        minOrder: 40000,
        estimatedDeliveryTime: "15-20 phút",
        isActive: true,
        isApproved: true,
        tags: ["Bán chạy", "Giá rẻ"],
      },
      {
        name: "Lẩu Hải Sản Biển Đông",
        owner: users[3]._id,
        description: "Lẩu hải sản tươi sống, nước lẩu đậm đà",
        cuisine: ["Hải sản", "Lẩu", "Nhà hàng"],
        avatar: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400",
        coverImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
        address: {
          street: "234 Võ Văn Tần",
          city: "Hồ Chí Minh",
          district: "Quận 3",
          ward: "Phường 6",
        },
        phone: "0902345681",
        email: "lauhaisan@restaurant.com",
        openingHours: {
          monday: { open: "10:00", close: "22:00", isOpen: true },
          tuesday: { open: "10:00", close: "22:00", isOpen: true },
          wednesday: { open: "10:00", close: "22:00", isOpen: true },
          thursday: { open: "10:00", close: "22:00", isOpen: true },
          friday: { open: "10:00", close: "23:00", isOpen: true },
          saturday: { open: "10:00", close: "23:00", isOpen: true },
          sunday: { open: "10:00", close: "22:00", isOpen: true },
        },
        rating: 4.7,
        totalReviews: 180,
        deliveryFee: 20000,
        minOrder: 100000,
        estimatedDeliveryTime: "25-35 phút",
        isActive: true,
        isApproved: true,
        tags: ["Cao cấp", "Hải sản tươi"],
      },
    ]);

    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Tạo products cho 3 nhà hàng
    console.log("🍜 Creating products...");
    const products = await Product.create([
      // Phở Hà Nội (3 món)
      {
        restaurant: restaurants[0]._id,
        name: "Phở Bò Tái",
        description: "Phở bò với thịt tái mềm, nước dùng trong ngọt",
        category: "Phở",
        price: 45000,
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 234,
        soldCount: 1250,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[0]._id,
        name: "Phở Gà",
        description: "Phở gà thơm ngon, nước trong",
        category: "Phở",
        price: 40000,
        image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 156,
        soldCount: 890,
      },
      {
        restaurant: restaurants[0]._id,
        name: "Phở Đặc Biệt",
        description: "Phở với đủ loại topping: tái, nạm, gân, sách",
        category: "Phở",
        price: 55000,
        image: "https://images.unsplash.com/photo-1603088010296-ec7e99ef1a7a?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 189,
        soldCount: 567,
        tags: ["Đặc sản"],
      },
      // Cơm Tấm (3 món)
      {
        restaurant: restaurants[1]._id,
        name: "Cơm Tấm Sườn Bì Chả",
        description: "Combo đầy đủ: sườn nướng + bì + chả + trứng",
        category: "Cơm",
        price: 45000,
        image: "https://images.unsplash.com/photo-1543353071-087092ec393a?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 456,
        soldCount: 2100,
        tags: ["Bán chạy", "Combo"],
      },
      {
        restaurant: restaurants[1]._id,
        name: "Cơm Tấm Sườn Nướng",
        description: "Sườn nướng thơm lừng",
        category: "Cơm",
        price: 42000,
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 234,
        soldCount: 1800,
      },
      {
        restaurant: restaurants[1]._id,
        name: "Cơm Tấm Đặc Biệt",
        description: "Cơm tấm với tất cả các loại: sườn, bì, chả, trứng ốp la",
        category: "Cơm",
        price: 55000,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 178,
        soldCount: 987,
        tags: ["Đặc biệt"],
      },
      // Lẩu Hải Sản (3 món)
      {
        restaurant: restaurants[2]._id,
        name: "Lẩu Hải Sản Đặc Biệt",
        description: "Tôm càng, cua biển, mực, nghêu, sò điệp (2-3 người)",
        category: "Lẩu",
        price: 450000,
        image: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 156,
        soldCount: 234,
        tags: ["Cao cấp"],
      },
      {
        restaurant: restaurants[2]._id,
        name: "Lẩu Tôm Càng",
        description: "Tôm càng tươi sống, nước lẩu ngọt thanh (2-3 người)",
        category: "Lẩu",
        price: 350000,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 98,
        soldCount: 167,
      },
      {
        restaurant: restaurants[2]._id,
        name: "Lẩu Cá Hồi",
        description: "Cá hồi tươi Nhật Bản, nước lẩu thanh mát (2-3 người)",
        category: "Lẩu",
        price: 380000,
        image: "https://images.unsplash.com/photo-1582270691936-82d7c86d9e38?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 87,
        soldCount: 145,
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Reset rating counters before generating fresh statistics
    await Restaurant.updateMany({}, { rating: 0, totalReviews: 0 });
    await Product.updateMany({}, { rating: 0, totalReviews: 0 });

    console.log("🛒 Creating sample orders & reviews...");
    const customers = users.filter((user) => user.role === "customer");

    const productsByRestaurant = products.reduce((acc, product) => {
      const key = product.restaurant.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    }, {});

    const orderSeeds = [];
    const reviewSeeds = [];

    const reviewSamples = [
      {
        rating: 5,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[4]._id,
        name: "Sashimi Set",
        description: "Sashimi cá hồi và cá ngừ tươi sống",
        category: "Sashimi",
        price: 220000,
        image: "https://images.unsplash.com/photo-1548943487-a2e4e45f7f45?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 234,
        soldCount: 567,
      },
      {
        restaurant: restaurants[4]._id,
        name: "Combo Sushi & Sashimi",
        description: "Combo sushi và sashimi đầy đủ",
        category: "Combo",
        price: 350000,
        image: "https://images.unsplash.com/photo-1562158070-9f8a6f03f7d4?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 189,
        soldCount: 423,
        tags: ["Cao cấp", "Combo"],
      },
      {
        restaurant: restaurants[4]._id,
        name: "Ramen Tonkotsu",
        description: "Ramen nước dùng xương heo đặc biệt",
        category: "Ramen",
        price: 85000,
        image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 156,
        soldCount: 678,
      },
      // Pizza Italia (3 món)
      {
        restaurant: restaurants[5]._id,
        name: "Pizza Margherita",
        description: "Pizza phô mai cà chua truyền thống Ý",
        category: "Pizza",
        price: 120000,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 195,
        soldCount: 543,
      },
      {
        restaurant: restaurants[5]._id,
        name: "Pizza Hải Sản",
        description: "Pizza với hải sản tươi: tôm, mực, nghêu",
        category: "Pizza",
        price: 150000,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 167,
        soldCount: 432,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[5]._id,
        name: "Pizza 4 Seasons",
        description: "Pizza 4 mùa với 4 loại topping khác nhau",
        category: "Pizza",
        price: 140000,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 123,
        soldCount: 321,
      },
      // Gà Rán (3 món)
      {
        restaurant: restaurants[6]._id,
        name: "Gà Rán 3 Miếng",
        description: "Gà rán giòn 3 miếng + khoai tây chiên",
        category: "Gà rán",
        price: 95000,
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 510,
        soldCount: 1234,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[6]._id,
        name: "Combo Gà + Khoai",
        description: "Gà rán + khoai tây chiên + pepsi",
        category: "Combo",
        price: 75000,
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
        isAvailable: true,
        rating: 4.4,
        totalReviews: 378,
        soldCount: 987,
      },
      {
        restaurant: restaurants[6]._id,
        name: "Burger Gà Giòn",
        description: "Burger gà giòn + rau xà lách + sốt",
        category: "Burger",
        price: 55000,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        isAvailable: true,
        rating: 4.3,
        totalReviews: 234,
        soldCount: 678,
      },
      // Trà Sữa (4 món)
      {
        restaurant: restaurants[7]._id,
        name: "Trà Sữa Truyền Thống",
        description: "Trà sữa Đài Loan nguyên bản với trân châu",
        category: "Trà sữa",
        price: 35000,
        image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 620,
        soldCount: 2345,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[7]._id,
        name: "Trà Sữa Ô Long",
        description: "Trà sữa ô long thơm mát với trân châu trắng",
        category: "Trà sữa",
        price: 40000,
        image: "https://images.unsplash.com/photo-1558857563-b1d70e1c4f79?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 489,
        soldCount: 1876,
      },
      {
        restaurant: restaurants[7]._id,
        name: "Trà Sữa Matcha",
        description: "Trà sữa matcha Nhật Bản với kem phô mai",
        category: "Trà sữa",
        price: 45000,
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 356,
        soldCount: 1234,
      },
      {
        restaurant: restaurants[7]._id,
        name: "Trà Sữa Đường Đen",
        description: "Trà sữa đường đen trân châu đặc biệt",
        category: "Trà sữa",
        price: 42000,
        image: "https://images.unsplash.com/photo-1524305148261-d45fba3dc23a?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 567,
        soldCount: 1987,
        tags: ["Đặc biệt"],
      },
      // Bánh Mì (4 món)
      {
        restaurant: restaurants[8]._id,
        name: "Bánh Mì Thịt Nướng",
        description: "Bánh mì thịt nướng đặc biệt + pate",
        category: "Bánh mì",
        price: 25000,
        image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 450,
        soldCount: 3210,
        tags: ["Bán chạy"],
      },
      {
        restaurant: restaurants[8]._id,
        name: "Bánh Mì Pate",
        description: "Bánh mì pate trứng + dưa leo + rau",
        category: "Bánh mì",
        price: 20000,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
        isAvailable: true,
        rating: 4.5,
        totalReviews: 324,
        soldCount: 2876,
      },
      {
        restaurant: restaurants[8]._id,
        name: "Bánh Mì Xíu Mại",
        description: "Bánh mì xíu mại sốt cà chua",
        category: "Bánh mì",
        price: 30000,
        image: "https://images.unsplash.com/photo-1604843192640-a6c90e7483b1?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 267,
        soldCount: 1765,
      },
      {
        restaurant: restaurants[8]._id,
        name: "Bánh Mì Chả Cá",
        description: "Bánh mì chả cá Nha Trang + rau thơm",
        category: "Bánh mì",
        price: 35000,
        image: "https://images.unsplash.com/photo-1621460248083-7f4f8b3b1b6a?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 198,
        soldCount: 1234,
        tags: ["Đặc sản"],
      },
      // BBQ Garden (4 món)
      {
        restaurant: restaurants[9]._id,
        name: "Set Nướng Hàn Quốc",
        description: "Set nướng Hàn Quốc cho 2 người với các loại thịt",
        category: "BBQ",
        price: 280000,
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
        isAvailable: true,
        rating: 4.8,
        totalReviews: 290,
        soldCount: 456,
        tags: ["Bán chạy", "Set"],
      },
      {
        restaurant: restaurants[9]._id,
        name: "Thịt Bò Nướng",
        description: "Thịt bò Úc nướng trên bếp than",
        category: "Thịt nướng",
        price: 150000,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        isAvailable: true,
        rating: 4.7,
        totalReviews: 234,
        soldCount: 678,
      },
      {
        restaurant: restaurants[9]._id,
        name: "Thịt Heo Nướng",
        description: "Thịt heo nướng BBQ sốt Hàn Quốc",
        category: "Thịt nướng",
        price: 120000,
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400",
        isAvailable: true,
        rating: 4.6,
        totalReviews: 198,
        soldCount: 543,
      },
      {
        restaurant: restaurants[9]._id,
        name: "Combo BBQ Đặc Biệt",
        description: "Combo BBQ đủ loại thịt cho 4 người",
        category: "Combo",
        price: 550000,
        image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400",
        isAvailable: true,
        rating: 4.9,
        totalReviews: 156,
        soldCount: 321,
        tags: ["Cao cấp", "Combo"],
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Reset rating counters before generating fresh statistics
    await Restaurant.updateMany({}, { rating: 0, totalReviews: 0 });
    await Product.updateMany({}, { rating: 0, totalReviews: 0 });

    console.log("🛒 Creating sample orders & reviews...");
    const customers = users.filter((user) => user.role === "customer");

    const productsByRestaurant = products.reduce((acc, product) => {
      const key = product.restaurant.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    }, {});

    const orderSeeds = [];
    const reviewSeeds = [];

    const reviewSamples = [
      {
        rating: 5,
        comment:
          "Món ăn rất ngon, đóng gói cẩn thận và giao đến vẫn còn nóng.",
        reply:
          "Cảm ơn bạn đã ủng hộ FoodFast! Hẹn gặp lại bạn trong đơn hàng tiếp theo.",
        images: [],
      },
      {
        rating: 4,
        comment: "Hương vị ổn, mong nhà hàng giảm lượng dầu để món nhẹ hơn.",
        reply:
          "Nhà hàng sẽ điều chỉnh lại công thức để phục vụ bạn tốt hơn. Cảm ơn góp ý!",
        images: [],
      },
      {
        rating: 5,
        comment: "Đóng gói đẹp, tốc độ giao cực nhanh. Rất hài lòng!",
        reply: "",
        images: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        ],
      },
      {
        rating: 3,
        comment: "Món ăn tạm được, phần mì hơi nhạt so với khẩu vị của tôi.",
        reply: "",
        images: [],
      },
      {
        rating: 2,
        comment:
          "Giao hơi trễ và món không còn nóng. Hy vọng lần sau sẽ tốt hơn.",
        reply:
          "FoodFast xin lỗi vì trải nghiệm chưa tốt. Chúng tôi sẽ cải thiện quy trình giao nhanh hơn.",
        images: [],
      },
      {
        rating: 4,
        comment:
          "Món ăn đúng mô tả, drone giao đến an toàn. Sẽ ủng hộ tiếp.",
        reply:
          "Cảm ơn bạn đã tin tưởng dịch vụ giao nhanh của chúng tôi!",
        images: [],
      },
    ];

    restaurants.forEach((restaurantDoc, restaurantIndex) => {
      const productList =
        productsByRestaurant[restaurantDoc._id.toString()] || [];
      if (!productList.length) {
        return;
      }

      const reviewFlags = [true, true, false];
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - (restaurantIndex + 1));

      reviewFlags.forEach((withReview, flagIndex) => {
        const customer =
          customers[(restaurantIndex + flagIndex) % customers.length];
        if (!customer) {
          return;
        }

        const productPool = [];
        for (let i = 0; i < Math.min(3, productList.length); i += 1) {
          const candidate =
            productList[(flagIndex + i) % productList.length];
          if (
            !productPool.find(
              (item) => item._id.toString() === candidate._id.toString()
            )
          ) {
            productPool.push(candidate);
          }
        }

        if (!productPool.length) {
          return;
        }

        const items = productPool.map((productDoc, itemIndex) => ({
          product: productDoc._id,
          name: productDoc.name,
          price: productDoc.price,
          quantity: itemIndex % 2 === 0 ? 1 : 2,
        }));

        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const deliveryFee = restaurantDoc.deliveryFee || 15000;
        const discount = flagIndex === 1 ? 10000 : 0;
        const total = subtotal + deliveryFee - discount;

        const createdAt = new Date(
          baseDate.getTime() + flagIndex * 3600000
        );
        const deliveredAt = new Date(createdAt.getTime() + 45 * 60000);

        const timeline = [
          {
            status: "pending",
            timestamp: createdAt,
            note: "Đơn hàng đã được tạo",
          },
          {
            status: "confirmed",
            timestamp: new Date(createdAt.getTime() + 5 * 60000),
            note: "Nhà hàng xác nhận đơn hàng",
          },
          {
            status: "preparing",
            timestamp: new Date(createdAt.getTime() + 12 * 60000),
            note: "Nhà hàng đang chuẩn bị món ăn",
          },
          {
            status: "delivering",
            timestamp: new Date(createdAt.getTime() + 30 * 60000),
            note: "Drone đang giao món ăn",
          },
        ];

        const orderDoc = {
          orderNumber: `FF${String(orderSeeds.length + 1).padStart(6, "0")}`,
          customer: customer._id,
          restaurant: restaurantDoc._id,
          items,
          subtotal,
          deliveryFee,
          discount,
          total,
          deliveryAddress: {
            label: customer.addresses?.[0]?.label || "Nhà",
            address: customer.addresses?.[0]?.address || "123 Nguyễn Huệ",
            city: customer.addresses?.[0]?.city || "Hồ Chí Minh",
            district: customer.addresses?.[0]?.district || "Quận 1",
            ward: customer.addresses?.[0]?.ward || "Phường Bến Nghé",
            phone: customer.phone,
          },
          paymentMethod: "paypal",
          paymentStatus: "paid",
          status: "delivered",
          estimatedDeliveryTime: new Date(
            createdAt.getTime() + 35 * 60000
          ),
          actualDeliveryTime: deliveredAt,
          timeline: [
            ...timeline,
            {
              status: "delivered",
              timestamp: deliveredAt,
              note: "Đơn hàng đã giao thành công",
            },
          ],
          createdAt,
          updatedAt: deliveredAt,
          isReviewed: withReview,
        };

        if (withReview) {
          const reviewSample =
            reviewSamples[
              (restaurantIndex + flagIndex) % reviewSamples.length
            ];
          const reviewProduct =
            items[flagIndex % items.length] || items[0];
          const reviewedAt = new Date(deliveredAt.getTime() + 10 * 60000);

          orderDoc.customerReview = {
            rating: reviewSample.rating,
            comment: reviewSample.comment,
            product: reviewProduct.product,
            images: reviewSample.images,
            reviewedAt,
          };

          reviewSeeds.push({
            orderIndex: orderSeeds.length,
            product: reviewProduct.product,
            rating: reviewSample.rating,
            comment: reviewSample.comment,
            images: reviewSample.images,
            reply: reviewSample.reply,
            createdAt: reviewedAt,
          });
        }

        orderSeeds.push(orderDoc);
      });
    });

    const seededOrders = await Order.insertMany(orderSeeds);
    console.log(`✅ Created ${seededOrders.length} orders`);

    const reviewDocs = reviewSeeds.map((seed) => {
      const orderDoc = seededOrders[seed.orderIndex];
      return {
        order: orderDoc._id,
        customer: orderDoc.customer,
        restaurant: orderDoc.restaurant,
        product: seed.product,
        rating: seed.rating,
        comment: seed.comment,
        images: seed.images,
        restaurantReply: seed.reply
          ? {
              comment: seed.reply,
              timestamp: new Date(seed.createdAt.getTime() + 5 * 60000),
            }
          : undefined,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      };
    });

    const seededReviews = reviewDocs.length
      ? await Review.insertMany(reviewDocs)
      : [];
    console.log(`✅ Created ${seededReviews.length} reviews`);

    const restaurantStats = await Review.aggregate([
      {
        $group: {
          _id: "$restaurant",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    for (const stat of restaurantStats) {
      await Restaurant.findByIdAndUpdate(stat._id, {
        rating: stat.averageRating ? Number(stat.averageRating.toFixed(2)) : 0,
        totalReviews: stat.totalReviews,
      });
    }

    const productStats = await Review.aggregate([
      { $match: { product: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    for (const stat of productStats) {
      await Product.findByIdAndUpdate(stat._id, {
        rating: stat.averageRating ? Number(stat.averageRating.toFixed(2)) : 0,
        totalReviews: stat.totalReviews,
      });
    }

    // Tạo drones cho 3 nhà hàng
    console.log("🚁 Creating drones...");
    const drones = await Drone.create([
      {
        droneId: "DRONE001",
        name: "Drone Phở Hà Nội 1",
        model: "DJI Delivery Pro",
        restaurant: restaurants[0]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: { lat: 10.7769, lng: 106.7009 },
        currentLocation: { lat: 10.7769, lng: 106.7009 },
        specifications: {
          flightTime: 35,
          speed: 45,
          manufacturer: "DJI",
          purchaseDate: new Date("2024-01-15"),
        },
      },
      {
        droneId: "DRONE002",
        name: "Drone Cơm Tấm 1",
        model: "Wing Mini",
        restaurant: restaurants[1]._id,
        status: "available",
        batteryLevel: 90,
        maxWeight: 3000,
        maxDistance: 8000,
        homeLocation: { lat: 10.7548, lng: 106.6665 },
        currentLocation: { lat: 10.7548, lng: 106.6665 },
        specifications: {
          flightTime: 25,
          speed: 40,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-03-01"),
        },
      },
      {
        droneId: "DRONE003",
        name: "Drone Lẩu Hải Sản 1",
        model: "Zipline Max",
        restaurant: restaurants[2]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 7000,
        maxDistance: 15000,
        homeLocation: { lat: 10.7808, lng: 106.6955 },
        currentLocation: { lat: 10.7808, lng: 106.6955 },
        specifications: {
          flightTime: 45,
          speed: 55,
          manufacturer: "Zipline",
          purchaseDate: new Date("2024-04-01"),
        },
      },
    ]);
        status: "available",
        batteryLevel: 85,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: { lat: 10.7821, lng: 106.6951 },
        currentLocation: { lat: 10.7821, lng: 106.6951 },
        specifications: {
          flightTime: 35,
          speed: 45,
          manufacturer: "DJI",
          purchaseDate: new Date("2024-05-01"),
        },
      },
      {
        droneId: "DRONE006",
        name: "Drone Pizza Italia 1",
        model: "Wing Mini",
        restaurant: restaurants[5]._id,
        status: "available",
        batteryLevel: 95,
        maxWeight: 4000,
        maxDistance: 9000,
        homeLocation: { lat: 10.7809, lng: 106.6910 },
        currentLocation: { lat: 10.7809, lng: 106.6910 },
        specifications: {
          flightTime: 30,
          speed: 42,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-06-01"),
        },
      },
      {
        droneId: "DRONE007",
        name: "Drone Gà Rán 1",
        model: "DJI Delivery Pro",
        restaurant: restaurants[6]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 5000,
        maxDistance: 10000,
        homeLocation: { lat: 10.8082, lng: 106.7099 },
        currentLocation: { lat: 10.8082, lng: 106.7099 },
        specifications: {
          flightTime: 35,
          speed: 45,
          manufacturer: "DJI",
          purchaseDate: new Date("2024-07-01"),
        },
      },
      {
        droneId: "DRONE008",
        name: "Drone Trà Sữa 1",
        model: "Wing Mini",
        restaurant: restaurants[7]._id,
        status: "available",
        batteryLevel: 80,
        maxWeight: 2000,
        maxDistance: 7000,
        homeLocation: { lat: 10.7728, lng: 106.6602 },
        currentLocation: { lat: 10.7728, lng: 106.6602 },
        specifications: {
          flightTime: 20,
          speed: 38,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-08-01"),
        },
      },
      {
        droneId: "DRONE009",
        name: "Drone Bánh Mì 1",
        model: "Wing Mini",
        restaurant: restaurants[8]._id,
        status: "available",
        batteryLevel: 90,
        maxWeight: 2000,
        maxDistance: 7000,
        homeLocation: { lat: 10.7676, lng: 106.6955 },
        currentLocation: { lat: 10.7676, lng: 106.6955 },
        specifications: {
          flightTime: 20,
          speed: 38,
          manufacturer: "Google Wing",
          purchaseDate: new Date("2024-09-01"),
        },
      },
      {
        droneId: "DRONE010",
        name: "Drone BBQ Garden 1",
        model: "Zipline Max",
        restaurant: restaurants[9]._id,
        status: "available",
        batteryLevel: 100,
        maxWeight: 7000,
        maxDistance: 15000,
        homeLocation: { lat: 10.7818, lng: 106.6932 },
        currentLocation: { lat: 10.7818, lng: 106.6932 },
        specifications: {
          flightTime: 45,
          speed: 55,
          manufacturer: "Zipline",
          purchaseDate: new Date("2024-10-01"),
        },
      },
    ]);

    console.log(`✅ Created ${drones.length} drones`);

    // Tạo vouchers (6 vouchers)
    console.log("🎟️  Creating vouchers...");
    const vouchers = await Voucher.create([
      {
        code: "WELCOME50",
        name: "Chào mừng thành viên mới",
        description: "Giảm 50.000đ cho đơn hàng đầu tiên",
        type: "fixed",
        value: 50000,
        minOrderValue: 100000,
        maxDiscount: 50000,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        maxUsage: 1000,
        currentUsage: 234,
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "FREEDEL",
        name: "Miễn phí giao hàng",
        description: "Miễn phí giao hàng cho đơn từ 150k",
        type: "free_delivery",
        value: 30000,
        minOrderValue: 150000,
        maxDiscount: 30000,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        maxUsage: null,
        currentUsage: 567,
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "FLASH30",
        name: "Flash Sale 30%",
        description: "Giảm 30% tối đa 100k",
        type: "percentage",
        value: 30,
        minOrderValue: 200000,
        maxDiscount: 100000,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2024-12-31"),
        maxUsage: 500,
        currentUsage: 123,
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
        maxDiscount: 50000,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2024-12-31"),
        maxUsage: 200,
        currentUsage: 89,
        applicableRestaurants: [restaurants[0]._id, restaurants[1]._id, restaurants[4]._id],
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "WEEKEND20",
        name: "Cuối tuần vui vẻ",
        description: "Giảm 20% cho đơn cuối tuần",
        type: "percentage",
        value: 20,
        minOrderValue: 150000,
        maxDiscount: 75000,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2024-12-31"),
        maxUsage: 300,
        currentUsage: 156,
        isActive: true,
        createdBy: users[0]._id,
      },
      {
        code: "DRONEFAST",
        name: "Giao drone siêu tốc",
        description: "Giảm 30k phí giao drone",
        type: "fixed",
        value: 30000,
        minOrderValue: 200000,
        maxDiscount: 30000,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2025-06-30"),
        maxUsage: 1000,
        currentUsage: 345,
        isActive: true,
        createdBy: users[0]._id,
      },
    ]);

    console.log(`✅ Created ${vouchers.length} vouchers`);

    console.log("\n🎉 Extended seed data completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: ${users.length} (1 admin, 10 restaurants, 2 customers)`);
    console.log(`   🏪 Restaurants: ${restaurants.length}`);
    console.log(`   🍜 Products: ${products.length}`);
    console.log(`   🛒 Orders: ${seededOrders.length}`);
    console.log(`   ⭐ Reviews: ${seededReviews.length}`);
    console.log(`   🚁 Drones: ${drones.length}`);
    console.log(`   🎟️  Vouchers: ${vouchers.length}`);
    console.log("\n📝 Test accounts:");
    console.log("   Admin: admin@foodfast.com / 123456");
    console.log("   Restaurants: phoviet@, buncha@, comtam@, lauhaisan@, sushitokyo@, pizza@, garan@, trasua@, banhmi@, bbq@ + restaurant.com / 123456");
    console.log("   Customers: customer1@gmail.com, customer2@gmail.com / 123456");
    console.log("\n🎟️  Voucher codes: WELCOME50, FREEDEL, FLASH30, SAVE50K, WEEKEND20, DRONEFAST");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding extended data:", error);
    process.exit(1);
  }
};

seedExtendedData();
