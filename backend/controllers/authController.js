import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeCoordinates = (input) => {
  if (!input || typeof input !== "object") {
    return undefined;
  }
  const lat = toNumber(input.lat ?? input.latitude);
  const lng = toNumber(input.lng ?? input.lon ?? input.longitude);
  if (lat == null || lng == null) {
    return undefined;
  }
  return { lat, lng };
};

const normalizeAddresses = (addresses, fallbackPhone) => {
  if (!Array.isArray(addresses)) {
    return undefined;
  }

  const normalized = addresses
    .map((entry) => {
      if (!entry) {
        return null;
      }

      const label = (entry.label ?? entry.name ?? "Địa chỉ").toString().trim();
      const addressLine =
        entry.address ??
        entry.addressLine ??
        entry.street ??
        entry.fullAddress ??
        "";

      const contactName = (entry.contactName ?? "").toString().trim();
      const contactPhone = (
        entry.contactPhone ??
        entry.phone ??
        fallbackPhone ??
        ""
      )
        .toString()
        .trim();

      if (!addressLine) {
        return null;
      }

      return {
        label,
        contactName,
        contactPhone,
        address: addressLine,
        city: entry.city ?? "",
        district: entry.district ?? "",
        ward: entry.ward ?? "",
        coordinates: normalizeCoordinates(entry.coordinates),
        isDefault: Boolean(entry.isDefault),
      };
    })
    .filter(Boolean);

  if (normalized.length > 0 && !normalized.some((item) => item.isDefault)) {
    normalized[0].isDefault = true;
  }

  return normalized;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, addresses } = req.body;

    // Check in users collection only
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    const normalizedAddresses = normalizeAddresses(addresses, phone);

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "customer",
      addresses: normalizedAddresses ?? [],
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
          addresses: user.addresses,
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
        console.log("⚠️ No restaurant found for user, but allowing login");
        // Tạm thời cho phép login mà không có restaurant data
        // User cần tạo restaurant sau khi login
        responseData.restaurant = null;
      } else {
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
      }
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
    const updates = {};

    if (typeof name === "string") {
      updates.name = name;
    }
    if (typeof phone === "string") {
      updates.phone = phone;
    }
    if (typeof avatar === "string") {
      updates.avatar = avatar;
    }

    if (addresses !== undefined) {
      const fallbackPhone =
        (typeof phone === "string" && phone) || req.user?.phone || "";
      const normalizedAddresses = normalizeAddresses(addresses, fallbackPhone);
      if (normalizedAddresses !== undefined) {
        updates.addresses = normalizedAddresses;
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

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

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

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

// Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

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
