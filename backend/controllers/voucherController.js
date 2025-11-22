import Voucher from "../models/Voucher.js";

// Get all active vouchers
export const getAllVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $expr: { $lt: ["$currentUsage", "$maxUsage"] },
    });

    res.json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single voucher
export const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Apply voucher to order
export const applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal, restaurantId } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã voucher và tổng tiền đơn hàng",
      });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Mã voucher không tồn tại",
      });
    }

    // Validate voucher
    const now = new Date();
    if (!voucher.isActive) {
      return res.status(400).json({
        success: false,
        message: "Voucher không còn hiệu lực",
      });
    }

    if (now < voucher.validFrom || now > voucher.validTo) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết hạn hoặc chưa có hiệu lực",
      });
    }

    if (voucher.currentUsage >= voucher.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết lượt sử dụng",
      });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`,
      });
    }

    // Check restaurant specific voucher
    if (
      voucher.applicableRestaurants &&
      voucher.applicableRestaurants.length > 0
    ) {
      if (
        restaurantId &&
        !voucher.applicableRestaurants.includes(restaurantId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Voucher không áp dụng cho nhà hàng này",
        });
      }
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === "percentage") {
      discount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    res.json({
      success: true,
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        discount: Math.round(discount),
        finalTotal: Math.round(orderTotal - discount),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create voucher (Admin only)
export const createVoucher = async (req, res) => {
  try {
    // Ensure code is uppercase
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const voucher = await Voucher.create(req.body);
    res.status(201).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update voucher (Admin only)
export const updateVoucher = async (req, res) => {
  try {
    // Ensure code is uppercase if provided
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete voucher (Admin only)
export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    await voucher.deleteOne();

    res.json({
      success: true,
      message: "Xóa voucher thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
