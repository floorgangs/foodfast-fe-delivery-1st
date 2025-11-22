import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check in users collection only
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "customer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    console.log("🔐 Login attempt:", { email, role });

    // Tìm user trong users collection
    const user = await User.findOne({ email }).select("+password");
    console.log("👤 User found:", !!user);
    console.log("🔑 Has password:", !!user?.password);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra role nếu được cung cấp
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản này không phải là ${role}`,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    const token = generateToken(user._id);

    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };

    // Nếu là restaurant user, lấy thông tin restaurant
    if (user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: user._id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin nhà hàng",
        });
      }

      if (!restaurant.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Nhà hàng chưa được phê duyệt",
        });
      }

      responseData.restaurant = {
        id: restaurant._id,
        name: restaurant.name,
        phone: restaurant.phone,
        avatar: restaurant.avatar,
        coverImage: restaurant.coverImage,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        openingHours: restaurant.openingHours,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
        isApproved: restaurant.isApproved,
        isBusy: restaurant.isBusy,
        tags: restaurant.tags,
      };

      console.log("✅ Restaurant login successful");
    } else if (user.role === "customer") {
      responseData.user.addresses = user.addresses;
      console.log("✅ Customer login successful");
    } else {
      console.log("✅ Admin login successful");
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, addresses } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar, addresses },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
