import Product from "../models/Product.js";
import Restaurant from "../models/Restaurant.js";

export const getProducts = async (req, res) => {
  try {
    const { restaurantId, category, search, includeHidden } = req.query;

    console.log('getProducts called with:', { restaurantId, includeHidden });

    let query = {};
    
    // Chỉ filter isAvailable nếu không phải restaurant owner xem món của mình
    if (includeHidden !== 'true') {
      query.isAvailable = true;
      console.log('Filtering by isAvailable=true');
    } else {
      console.log('Including hidden items');
    }

    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).populate(
      "restaurant",
      "name avatar"
    );

    const normalizedProducts = products.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      const images = Array.isArray(obj.images) ? obj.images : [];
      const fallback = images.length > 0 ? images[0] : obj.image;
      return {
        ...obj,
        image: obj.image || fallback,
      };
    });

    res.json({
      success: true,
      count: normalizedProducts.length,
      data: normalizedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "restaurant",
      "name avatar address phone"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    const obj = product.toObject ? product.toObject() : product;
    const images = Array.isArray(obj.images) ? obj.images : [];
    const fallback = images.length > 0 ? images[0] : obj.image;
    const normalized = {
      ...obj,
      image: obj.image || fallback,
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

export const createProduct = async (req, res) => {
  try {
    // Get restaurant owned by user
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa có nhà hàng",
      });
    }

    const productData = {
      ...req.body,
      restaurant: restaurant._id,
    };

    const product = await Product.create(productData);

    const obj = product.toObject ? product.toObject() : product;
    const images = Array.isArray(obj.images) ? obj.images : [];
    const fallback = images.length > 0 ? images[0] : obj.image;
    const normalized = {
      ...obj,
      image: obj.image || fallback,
    };

    res.status(201).json({
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

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "restaurant"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    // Check ownership
    if (
      product.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa món ăn này",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const obj = updatedProduct.toObject ? updatedProduct.toObject() : updatedProduct;
    const images = Array.isArray(obj.images) ? obj.images : [];
    const fallback = images.length > 0 ? images[0] : obj.image;
    const normalized = {
      ...obj,
      image: obj.image || fallback,
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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "restaurant"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    // Check ownership
    if (
      product.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa món ăn này",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Đã xóa món ăn",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
