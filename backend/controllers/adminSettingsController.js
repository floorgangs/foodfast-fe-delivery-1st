import AdminSettings from "../models/AdminSettings.js";
import Transaction from "../models/Transaction.js";
import Restaurant from "../models/Restaurant.js";

// Get admin settings
export const getSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Calculate pending withdrawals
    const pendingWithdrawals = await Transaction.aggregate([
      { $match: { type: "withdraw", status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    // Calculate total restaurant balances
    const restaurantBalances = await Restaurant.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    res.json({
      success: true,
      data: {
        ...settings.toObject(),
        pendingWithdrawals: pendingWithdrawals[0]?.total || 0,
        totalRestaurantBalances: restaurantBalances[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get admin settings error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải cài đặt",
      error: error.message,
    });
  }
};

// Update admin settings
export const updateSettings = async (req, res) => {
  try {
    const {
      paypalEmail,
      paypalClientId,
      paypalClientSecret,
      commissionRate,
      minWithdrawAmount,
      autoPayoutEnabled,
      autoPayoutThreshold,
    } = req.body;

    let settings = await AdminSettings.getSettings();

    // Update fields
    if (paypalEmail) settings.paypalEmail = paypalEmail;
    if (paypalClientId !== undefined) settings.paypalClientId = paypalClientId;
    if (paypalClientSecret !== undefined) settings.paypalClientSecret = paypalClientSecret;
    if (commissionRate !== undefined) settings.commissionRate = commissionRate;
    if (minWithdrawAmount !== undefined) settings.minWithdrawAmount = minWithdrawAmount;
    if (autoPayoutEnabled !== undefined) settings.autoPayoutEnabled = autoPayoutEnabled;
    if (autoPayoutThreshold !== undefined) settings.autoPayoutThreshold = autoPayoutThreshold;
    
    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: "Cập nhật cài đặt thành công",
      data: settings,
    });
  } catch (error) {
    console.error("Update admin settings error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật cài đặt",
      error: error.message,
    });
  }
};

// Update system balance (called after receiving payments)
export const updateSystemBalance = async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'add' or 'subtract'

    let settings = await AdminSettings.getSettings();

    if (type === "add") {
      settings.systemBalance += amount;
      settings.totalRevenue += amount;
    } else if (type === "subtract") {
      settings.systemBalance -= amount;
      settings.totalPayouts += amount;
    }

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: "Cập nhật số dư thành công",
      data: settings,
    });
  } catch (error) {
    console.error("Update system balance error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật số dư",
      error: error.message,
    });
  }
};

// Get financial summary
export const getFinancialSummary = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Get all transactions summary
    const transactionSummary = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get pending withdrawals
    const pendingWithdrawals = await Transaction.find({
      type: "withdraw",
      status: "pending",
    })
      .populate("restaurant", "name paypalEmail")
      .sort({ createdAt: -1 });

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total restaurant balances
    const restaurantBalances = await Restaurant.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    res.json({
      success: true,
      data: {
        settings: {
          paypalEmail: settings.paypalEmail,
          commissionRate: settings.commissionRate,
          systemBalance: settings.systemBalance,
          totalRevenue: settings.totalRevenue,
          totalCommission: settings.totalCommission,
          totalPayouts: settings.totalPayouts,
        },
        transactionSummary,
        pendingWithdrawals,
        todayTransactions,
        totalRestaurantBalances: restaurantBalances[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get financial summary error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải báo cáo tài chính",
      error: error.message,
    });
  }
};
