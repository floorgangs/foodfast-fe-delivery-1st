import Staff from "../models/Staff.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

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

    // Get staff from Staffs collection
    const staff = await Staff.find({ 
      restaurant: restaurantId
    }).populate('user', 'name email phone').sort({ createdAt: -1 });

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
    const staff = await Staff.find({})
      .populate("restaurant", "name")
      .populate("user", "name email phone")
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
    const { 
      name, 
      phone, 
      email,
      password,
      position,
      salary,
      startDate,
      idCard,
      address,
      birthDate,
      emergencyContact,
      workSchedule,
    } = req.body;

    console.log('🔍 Adding staff:', { restaurantId, name, phone, position });

    // Check if admin or restaurant owner
    const isAdmin = req.user.role === "admin";
    
    if (!isAdmin) {
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        $or: [
          { owner: req.user._id },
          { _id: req.user.restaurant }
        ]
      });

      if (!restaurant) {
        console.log('❌ Restaurant not found or not authorized');
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng hoặc không có quyền",
        });
      }
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu là bắt buộc",
      });
    }

    // Check if phone already exists for staff in this restaurant
    const existingPhone = await Staff.findOne({
      restaurant: restaurantId,
      phone: phone,
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại này đã được sử dụng",
      });
    }

    let userId = null;
    let hasAccount = false;

    // Create user account if email and password provided
    if (email && password) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được đăng ký",
        });
      }

      // Create user with role "staff" - password sẽ được hash tự động bởi pre-save hook
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password, // Để nguyên, sẽ được hash bởi pre-save hook
        phone,
        role: "staff",
        restaurant: restaurantId,
        isVerified: true,
      });

      userId = newUser._id;
      hasAccount = true;
      console.log('✅ User account created:', newUser._id);
    }

    // Create staff record in Staffs collection
    const newStaff = await Staff.create({
      restaurant: restaurantId,
      user: userId,
      name,
      phone,
      email: email || '',
      position,
      salary,
      startDate: startDate || new Date(),
      idCard,
      address,
      birthDate,
      emergencyContact,
      workSchedule,
      isActive: true,
      hasAccount,
    });

    console.log('✅ Staff record created:', newStaff._id);

    // Populate relations
    await newStaff.populate("restaurant", "name");
    if (userId) {
      await newStaff.populate("user", "name email phone");
    }

    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: newStaff,
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
    const { 
      name, 
      phone, 
      email,
      position, 
      salary,
      startDate,
      idCard,
      address,
      birthDate,
      emergencyContact,
      workSchedule,
      isActive,
      createAccount,
      password 
    } = req.body;

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

    // Create user account if requested and doesn't exist
    if (createAccount && email && password && !staff.hasAccount) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được đăng ký tài khoản",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: name || staff.name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || staff.phone,
        role: "staff",
        restaurant: staff.restaurant._id,
        isVerified: true,
      });

      staff.user = newUser._id;
      staff.hasAccount = true;
      console.log('✅ User account created for existing staff:', newUser._id);
    }

    // Update fields
    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (email) staff.email = email;
    if (position) staff.position = position;
    if (salary !== undefined) staff.salary = salary;
    if (startDate) staff.startDate = startDate;
    if (idCard) staff.idCard = idCard;
    if (address) staff.address = address;
    if (birthDate) staff.birthDate = birthDate;
    if (emergencyContact) staff.emergencyContact = emergencyContact;
    if (workSchedule) staff.workSchedule = workSchedule;
    if (typeof isActive !== "undefined") staff.isActive = isActive;

    await staff.save();
    await staff.populate("restaurant", "name");
    await staff.populate("user", "name email");

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

    // Delete associated user account if exists
    if (staff.user) {
      await User.findByIdAndDelete(staff.user);
      console.log('✅ User account deleted:', staff.user);
    }

    // Delete staff record
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
