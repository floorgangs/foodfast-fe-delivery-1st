import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Lấy thống kê tổng quan cho admin
export const getDashboardStats = async (req, res) => {
  try {
    // Đếm restaurants
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({
      isActive: true,
      isApproved: true,
    });
    const pendingApprovals = await Restaurant.countDocuments({
      isApproved: false,
    });

    // Đếm orders
    const totalOrders = await Order.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    // Tính revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["completed", "delivering", "delivered"] } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $in: ["completed", "delivering", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    // Đếm users
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalStaff = await User.countDocuments({
      role: { $in: ["restaurant", "admin"] },
    });

    // Đếm products
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      data: {
        totalRestaurants,
        activeRestaurants,
        pendingApprovals,
        totalOrders,
        todayOrders,
        totalRevenue,
        todayRevenue,
        totalCustomers,
        totalStaff,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
    });
  }
};

// Lấy đơn hàng gần đây
export const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name email")
      .populate("restaurant", "name")
      .select("orderNumber totalAmount status createdAt");

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy đơn hàng",
    });
  }
};

// Lấy nhà hàng chờ duyệt
export const getPendingRestaurants = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const restaurants = await Restaurant.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("owner", "name email phone")
      .select("name owner createdAt");

    res.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("Pending restaurants error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy nhà hàng chờ duyệt",
    });
  }
};
