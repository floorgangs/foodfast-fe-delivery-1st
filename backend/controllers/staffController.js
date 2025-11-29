import Staff from "../models/Staff.js";
import Restaurant from "../models/Restaurant.js";

// Get all staff for a restaurant
export const getRestaurantStaff = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if admin or restaurant owner
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin) {
      // Verify restaurant belongs to user
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        owner: req.user._id,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng",
        });
      }
    }

    const staff = await Staff.find({ restaurant: restaurantId })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get restaurant staff error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách nhân viên",
      error: error.message,
    });
  }
};

// Get all staff (Admin only)
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get all staff error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách nhân viên",
      error: error.message,
    });
  }
};

// Add new staff
export const addStaff = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, phone, position } = req.body;

    console.log('🔍 Adding staff:', { restaurantId, name, phone, position });
    console.log('🔍 User:', req.user?._id, req.user?.role);

    // Check if admin or restaurant owner
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin) {
      // For restaurant users, check if they own the restaurant OR have restaurant field
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        $or: [
          { owner: req.user._id },
          { _id: req.user.restaurant } // Also allow if user.restaurant matches
        ]
      });

      if (!restaurant) {
        console.log('❌ Restaurant not found or not authorized');
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng hoặc không có quyền",
        });
      }
    } else {
      // Admin - just verify restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng",
        });
      }
    }

    // Check if phone already exists for this restaurant
    const existingStaff = await Staff.findOne({
      restaurant: restaurantId,
      phone: phone,
    });

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại này đã được sử dụng",
      });
    }

    const staff = await Staff.create({
      restaurant: restaurantId,
      name,
      phone,
      position,
    });

    console.log('✅ Staff created:', staff._id);

    // Populate restaurant info before sending response
    await staff.populate("restaurant", "name");

    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: staff,
    });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nhân viên",
      error: error.message,
    });
  }
};

// Update staff
export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, phone, position, isActive } = req.body;

    const staff = await Staff.findById(staffId).populate("restaurant");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    // Check if admin or restaurant owner
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin) {
      // Verify restaurant belongs to user
      if (staff.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền chỉnh sửa nhân viên này",
        });
      }
    }

    // If changing phone, check for duplicates
    if (phone && phone !== staff.phone) {
      const existingStaff = await Staff.findOne({
        restaurant: staff.restaurant._id,
        phone: phone,
        _id: { $ne: staffId },
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại này đã được sử dụng",
        });
      }
    }

    // Update fields
    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (position) staff.position = position;
    if (typeof isActive !== "undefined") staff.isActive = isActive;

    await staff.save();
    await staff.populate("restaurant", "name");

    res.json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: staff,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhân viên",
      error: error.message,
    });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId).populate("restaurant");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    // Check if admin or restaurant owner
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin) {
      // Verify restaurant belongs to user
      if (staff.restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền xóa nhân viên này",
        });
      }
    }

    await Staff.findByIdAndDelete(staffId);

    res.json({
      success: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhân viên",
      error: error.message,
    });
  }
};
