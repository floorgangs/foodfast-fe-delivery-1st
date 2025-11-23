import SavedOrder from "../models/SavedOrder.js";
import mongoose from "mongoose";

// GET /api/saved-orders - Lấy danh sách đơn tạm
export const getSavedOrders = async (req, res, next) => {
  try {
    const { restaurantId, limit = 20, skip = 0 } = req.query;

    const query = { user: req.user._id };
    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    const savedOrders = await SavedOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const formatted = savedOrders.map((order) => ({
      id: order._id.toString(),
      restaurantId: order.restaurant.toString(),
      restaurantName: order.restaurantName,
      items: order.items.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: order.total,
      deliveryAddress: order.deliveryAddress,
      note: order.note,
      voucherCode: order.voucherCode,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      displayName: order.displayName,
      tags: order.tags || [],
      orderCount: order.orderCount || 0,
      lastOrderedAt: order.lastOrderedAt,
      savedAt: order.createdAt,
    }));

    return res.json({
      success: true,
      data: formatted,
      total: await SavedOrder.countDocuments(query),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/saved-orders - Lưu đơn tạm mới
export const createSavedOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      restaurantName,
      items,
      total,
      deliveryAddress,
      note,
      voucherCode,
      discount,
      deliveryFee,
      displayName,
      tags,
    } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin nhà hàng hoặc món ăn",
      });
    }

    const savedOrder = await SavedOrder.create({
      user: req.user._id,
      restaurant: restaurantId,
      restaurantName,
      items: items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: total || items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      deliveryAddress,
      note,
      voucherCode,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      displayName,
      tags: tags || [],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: savedOrder._id.toString(),
        restaurantId: savedOrder.restaurant.toString(),
        restaurantName: savedOrder.restaurantName,
        items: savedOrder.items,
        total: savedOrder.total,
        displayName: savedOrder.displayName,
        savedAt: savedOrder.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/saved-orders/:id - Cập nhật đơn tạm
export const updateSavedOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { displayName, tags, items, note, deliveryAddress } = req.body;

    const savedOrder = await SavedOrder.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!savedOrder) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    if (displayName !== undefined) savedOrder.displayName = displayName;
    if (tags !== undefined) savedOrder.tags = tags;
    if (note !== undefined) savedOrder.note = note;
    if (deliveryAddress !== undefined) savedOrder.deliveryAddress = deliveryAddress;

    if (items && items.length > 0) {
      savedOrder.items = items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));
      savedOrder.total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    await savedOrder.save();

    return res.json({
      success: true,
      data: {
        id: savedOrder._id.toString(),
        displayName: savedOrder.displayName,
        tags: savedOrder.tags,
        total: savedOrder.total,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/saved-orders/:id - Xóa đơn tạm
export const deleteSavedOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await SavedOrder.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    return res.json({
      success: true,
      message: "Đã xóa đơn tạm",
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/saved-orders/:id/order - Đặt hàng từ đơn tạm
export const orderFromSaved = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savedOrder = await SavedOrder.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!savedOrder) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn tạm",
      });
    }

    // Cập nhật metadata
    savedOrder.orderCount += 1;
    savedOrder.lastOrderedAt = new Date();
    await savedOrder.save();

    // Return data để frontend tạo order thật
    return res.json({
      success: true,
      data: {
        restaurantId: savedOrder.restaurant.toString(),
        restaurantName: savedOrder.restaurantName,
        items: savedOrder.items,
        total: savedOrder.total,
        deliveryAddress: savedOrder.deliveryAddress,
        note: savedOrder.note,
        voucherCode: savedOrder.voucherCode,
        discount: savedOrder.discount,
        deliveryFee: savedOrder.deliveryFee,
      },
    });
  } catch (error) {
    return next(error);
  }
};
