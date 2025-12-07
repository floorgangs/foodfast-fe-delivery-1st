import Restaurant from "../models/Restaurant.js";
import Voucher from "../models/Voucher.js";

const parseDate = (value) => {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const normalizeDocument = (doc) => {
  if (!doc) {
    return undefined;
  }
  const content = doc.content || doc.base64 || doc.documentImage || doc.image;
  if (!content) {
    return undefined;
  }
  return {
    filename: doc.filename || doc.name,
    content,
    mimeType: doc.mimeType || doc.type,
  };
};

const normalizeCompliance = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    return {
      status: "pending",
      submittedAt: new Date(),
    };
  }

  const relatedDocs = Array.isArray(payload.relatedDocuments)
    ? payload.relatedDocuments.map(normalizeDocument).filter(Boolean)
    : [];

  return {
    status: "pending",
    submittedAt: payload.submittedAt
      ? parseDate(payload.submittedAt)
      : new Date(),
    notes: payload.notes,
    idCard: {
      number: payload.idCard?.number || payload.idCardNumber,
      issueDate: parseDate(
        payload.idCard?.issueDate || payload.idCardIssueDate
      ),
      issuePlace: payload.idCard?.issuePlace || payload.idCardIssuePlace,
      frontImage: payload.idCard?.frontImage || payload.idCardFront,
      backImage: payload.idCard?.backImage || payload.idCardBack,
    },
    businessLicense: {
      documentImage:
        payload.businessLicense?.documentImage || payload.businessLicenseImage,
      filename:
        payload.businessLicense?.filename || payload.businessLicense?.name,
    },
    tax: {
      code: payload.tax?.code || payload.taxCode,
      rate: payload.tax?.rate || payload.taxRate,
      certificateImage: payload.tax?.certificateImage || payload.taxCertificate,
    },
    relatedDocuments: relatedDocs,
  };
};

export const getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, sort } = req.query;

    let query = { isActive: true, isApproved: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { cuisine: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    let sortOption = {};
    if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "deliveryFee") sortOption = { deliveryFee: 1 };
    else sortOption = { createdAt: -1 };

    const restaurants = await Restaurant.find(query)
      .populate("owner", "name email phone")
      .sort(sortOption);

    const now = new Date();
    const normalizedRestaurants = await Promise.all(
      restaurants.map(async (doc) => {
        const obj = doc.toObject ? doc.toObject() : doc;
        const vouchers = await Voucher.find({
          $or: [
            { applicableRestaurants: obj._id },
            { applicableRestaurants: { $size: 0 } },
          ],
          isActive: true,
          validFrom: { $lte: now },
          validUntil: { $gte: now },
        })
          .sort({ value: -1 })
          .limit(3)
          .lean();

        return {
          ...obj,
          image: obj.image || obj.coverImage || obj.avatar,
          vouchers,
        };
      })
    );

    res.json({
      success: true,
      count: normalizedRestaurants.length,
      data: normalizedRestaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    const obj = restaurant.toObject ? restaurant.toObject() : restaurant;
    const normalized = {
      ...obj,
      image: obj.image || obj.coverImage || obj.avatar,
    };

    res.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const { compliance: compliancePayload, ...rest } = req.body || {};

    const restaurantData = {
      ...rest,
      owner: req.user._id,
      isApproved: false,
      isActive: false,
      compliance: normalizeCompliance(compliancePayload),
    };

    if (restaurantData.deliveryFee != null) {
      restaurantData.deliveryFee = Number(restaurantData.deliveryFee) || 0;
    }
    if (restaurantData.minOrder != null) {
      restaurantData.minOrder = Number(restaurantData.minOrder) || 0;
    }
    if (restaurantData.estimatedDeliveryTime == null) {
      restaurantData.estimatedDeliveryTime = "30-45 phút";
    }

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Check ownership
    if (
      restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa nhà hàng này",
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedRestaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Restaurant Login
export const restaurantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const restaurant = await Restaurant.findOne({ email }).select("+password");

    console.log("🏪 Restaurant found:", !!restaurant);
    console.log("🔑 Has password:", !!restaurant?.password);

    if (!restaurant || !(await restaurant.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (!restaurant.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản nhà hàng đã bị khóa",
      });
    }

    if (!restaurant.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản nhà hàng chưa được duyệt",
      });
    }

    const token = generateToken(restaurant._id);

    res.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          avatar: restaurant.avatar,
          address: restaurant.address,
          rating: restaurant.rating,
          totalReviews: restaurant.totalReviews,
          owner: restaurant.owner, // Include owner ID
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

// Get current restaurant profile (for logged-in restaurant)
export const getMyRestaurant = async (req, res) => {
  try {
    // req.user._id is the USER ID (from auth middleware)
    // Support multi-restaurant: Find all restaurants owned by this user
    const restaurants = await Restaurant.find({ owner: req.user._id }).populate(
      "owner",
      "name email phone role"
    );

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhà hàng",
      });
    }

    // If user has 1 restaurant, return object. If multiple, return array
    res.json({
      success: true,
      data: restaurants.length === 1 ? restaurants[0] : restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ADMIN APPROVAL FUNCTIONS ====================

// Get all pending restaurants (for admin)
export const getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      $or: [{ isApproved: false }, { "compliance.status": "pending" }],
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all restaurants for admin (including unapproved)
export const getAllRestaurantsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    // Filter by approval status
    if (status === "pending") {
      query.isApproved = false;
      query["compliance.status"] = "pending";
    } else if (status === "approved") {
      query.isApproved = true;
    } else if (status === "rejected") {
      query["compliance.status"] = "rejected";
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const restaurants = await Restaurant.find(query)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve restaurant (admin only)
export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Update approval status
    restaurant.isApproved = true;
    restaurant.isActive = true;
    restaurant.compliance.status = "approved";
    restaurant.compliance.approvedAt = new Date();
    restaurant.compliance.approvedBy = req.user._id;
    if (notes) {
      restaurant.compliance.notes = notes;
    }

    await restaurant.save();

    // TODO: Send notification/email to restaurant owner

    res.json({
      success: true,
      message: "Nhà hàng đã được duyệt thành công",
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject restaurant (admin only)
export const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp lý do từ chối",
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Update rejection status
    restaurant.isApproved = false;
    restaurant.compliance.status = "rejected";
    restaurant.compliance.rejectedAt = new Date();
    restaurant.compliance.rejectedBy = req.user._id;
    restaurant.compliance.rejectionReason = reason;

    await restaurant.save();

    // TODO: Send notification/email to restaurant owner with rejection reason

    res.json({
      success: true,
      message: "Đã từ chối nhà hàng",
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get restaurant compliance details (admin only)
export const getRestaurantCompliance = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate("owner", "name email phone")
      .select("+compliance");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    res.json({
      success: true,
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        owner: restaurant.owner,
        phone: restaurant.phone,
        address: restaurant.address,
        isApproved: restaurant.isApproved,
        isActive: restaurant.isActive,
        compliance: restaurant.compliance,
        createdAt: restaurant.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Delete restaurant (hard delete)
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Check authorization (only admin can delete)
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa nhà hàng",
      });
    }

    // Also delete owner account
    if (restaurant.owner) {
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndDelete(restaurant.owner);
      console.log(`[Admin] Deleted owner account: ${restaurant.owner}`);
    }

    // Hard delete restaurant
    await Restaurant.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Đã xóa nhà hàng và tài khoản chủ nhà hàng thành công",
      data: { _id: id, name: restaurant.name },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Create restaurant with owner account
export const createRestaurantWithOwner = async (req, res) => {
  try {
    const {
      // Restaurant info
      name,
      description,
      cuisine,
      address,
      phone,
      deliveryFee,
      minOrder,
      estimatedDeliveryTime,
      // Owner info
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword,
    } = req.body;

    console.log("[Admin] Creating restaurant with owner:", {
      name,
      ownerEmail,
    });

    // Validate required fields
    if (!name || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    if (!phone && !ownerPhone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số điện thoại",
      });
    }

    // Check if owner email already exists
    const User = (await import("../models/User.js")).default;
    const existingUser = await User.findOne({
      email: ownerEmail.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email chủ nhà hàng đã tồn tại trong hệ thống",
      });
    }

    // Check if restaurant name already exists
    const existingRestaurant = await Restaurant.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Tên nhà hàng đã tồn tại",
      });
    }

    // Create owner account
    const owner = await User.create({
      name: ownerName.trim(),
      email: ownerEmail.trim().toLowerCase(),
      phone: ownerPhone.trim(),
      password: ownerPassword,
      role: "restaurant",
      isActive: true,
    });

    console.log("[Admin] Owner account created:", owner._id);

    // Parse cuisine array
    let cuisineArray = [];
    if (cuisine) {
      if (Array.isArray(cuisine)) {
        cuisineArray = cuisine.filter(Boolean);
      } else if (typeof cuisine === "string") {
        cuisineArray = cuisine
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
    }

    // Parse address
    let restaurantAddress = address;
    if (typeof address === "string") {
      restaurantAddress = { street: address };
    } else if (typeof address === "object" && address !== null) {
      restaurantAddress = {
        street: address.street || "",
        ward: address.ward || "",
        district: address.district || "",
        city: address.city || "Hồ Chí Minh",
        coordinates: address.coordinates || undefined,
      };
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name: name.trim(),
      description: description?.trim() || "",
      cuisine: cuisineArray,
      address: restaurantAddress,
      phone: phone?.trim() || ownerPhone.trim(),
      avatar:
        req.body.avatar ||
        "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(name.trim()) +
          "&background=ff6b35&color=fff&size=300",
      coverImage:
        req.body.coverImage ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
      owner: owner._id,
      deliveryFee: Number(deliveryFee) || 15000,
      minOrder: Number(minOrder) || 0,
      estimatedDeliveryTime: estimatedDeliveryTime || "30-45 phút",
      isApproved: true, // Admin created, auto approve
      isActive: true,
      compliance: {
        status: "approved",
        submittedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: req.user._id,
        notes: "Tạo bởi admin",
      },
    });

    console.log("[Admin] Restaurant created:", restaurant._id);

    // Update user with restaurant reference
    await User.findByIdAndUpdate(owner._id, {
      restaurant: restaurant._id,
    });

    const populatedRestaurant = await Restaurant.findById(
      restaurant._id
    ).populate("owner", "name email phone");

    res.status(201).json({
      success: true,
      message: "Tạo nhà hàng thành công",
      data: {
        restaurant: populatedRestaurant,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
        },
      },
    });
  } catch (error) {
    console.error("[Admin] Error creating restaurant:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo nhà hàng",
    });
  }
};
