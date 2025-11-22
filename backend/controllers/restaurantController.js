import Restaurant from "../models/Restaurant.js";
import Voucher from "../models/Voucher.js";

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
    const restaurantData = {
      ...req.body,
      owner: req.user._id,
    };

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
