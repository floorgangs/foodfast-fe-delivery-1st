import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";

const toStringOrNull = (value) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const createDocumentId = (value, prefix) =>
  toStringOrNull(value) ?? `${prefix}-${new mongoose.Types.ObjectId().toString()}`;

const ensureNumeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ensureQuantity = (value) => {
  const parsed = Math.floor(ensureNumeric(value, 1));
  return parsed > 0 ? parsed : 1;
};

const calculateTotal = (items = []) =>
  items.reduce((sum, item) => sum + ensureNumeric(item.price) * ensureQuantity(item.quantity), 0);

const normalizeCartItemInput = (item) => {
  if (!item) {
    return null;
  }

  const productId = toStringOrNull(item.productId ?? item.id ?? item._id);
  const restaurantId = toStringOrNull(item.restaurantId ?? item.restaurant?.toString?.());

  if (!productId || !restaurantId) {
    return null;
  }

  return {
    _id: createDocumentId(item.id ?? item._id, "item"),
    productId,
    name: String(item.name ?? ""),
    price: ensureNumeric(item.price, 0),
    quantity: ensureQuantity(item.quantity),
    restaurantId,
    restaurantName: item.restaurantName ? String(item.restaurantName) : "",
    image: item.image ? String(item.image) : undefined,
  };
};

const buildResponsePayload = (cartDoc) => {
  if (!cartDoc) {
    return {
      items: [],
      total: 0,
      currentRestaurantId: null,
      currentRestaurantName: null,
    };
  }

  const doc = cartDoc.toObject({ getters: true, virtuals: false });
  const items = Array.isArray(doc.items) ? doc.items.map((item) => ({
    id: String(item._id ?? createDocumentId(undefined, "item")),
    productId: String(item.productId ?? ""),
    name: String(item.name ?? ""),
    price: ensureNumeric(item.price, 0),
    quantity: ensureQuantity(item.quantity),
    restaurantId: item.restaurantId ? String(item.restaurantId) : "",
    restaurantName: item.restaurantName ? String(item.restaurantName) : "",
    image: item.image ? String(item.image) : undefined,
  })) : [];

  return {
    items,
    total: ensureNumeric(doc.total, calculateTotal(items)),
    currentRestaurantId: doc.currentRestaurantId ? String(doc.currentRestaurantId) : null,
    currentRestaurantName: doc.currentRestaurantName ? String(doc.currentRestaurantName) : null,
  };
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.json({ 
        success: true, 
        data: { items: [], total: 0, currentRestaurantId: null, currentRestaurantName: null } 
      });
    }

    // Lấy items từ CartItem collection
    const cartItems = await CartItem.find({ cartId: cart._id }).populate('itemId', 'name price image');
    
    const items = cartItems.map(item => ({
      id: item._id.toString(),
      productId: item.itemId?._id?.toString() || '',
      name: item.itemId?.name || '',
      price: item.itemId?.price || 0,
      quantity: item.quantity,
      restaurantId: cart.currentRestaurantId || '',
      restaurantName: cart.currentRestaurantName || '',
      image: item.itemId?.image,
      note: item.note,
    }));

    return res.json({ 
      success: true, 
      data: {
        items,
        total: cart.total,
        currentRestaurantId: cart.currentRestaurantId,
        currentRestaurantName: cart.currentRestaurantName,
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const upsertCart = async (req, res, next) => {
  try {
    const normalizedItems = Array.isArray(req.body?.items)
      ? req.body.items
          .map((item) => normalizeCartItemInput(item))
          .filter(Boolean)
      : [];

    const total = ensureNumeric(req.body?.total, calculateTotal(normalizedItems));
    const currentRestaurantId =
      normalizedItems[0]?.restaurantId ?? toStringOrNull(req.body?.currentRestaurantId);
    const currentRestaurantName =
      normalizedItems[0]?.restaurantName ?? toStringOrNull(req.body?.currentRestaurantName);

    // Tìm hoặc tạo Cart
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [], // Không lưu items ở đây nữa
        total,
        currentRestaurantId,
        currentRestaurantName,
        metadata: {
          lastClientUpdate: new Date(),
          clientDevice: toStringOrNull(req.headers["user-agent"]),
        },
      });
    } else {
      cart.total = total;
      cart.currentRestaurantId = currentRestaurantId;
      cart.currentRestaurantName = currentRestaurantName;
      cart.metadata = {
        lastClientUpdate: new Date(),
        clientDevice: toStringOrNull(req.headers["user-agent"]),
      };
      await cart.save();
    }

    // Xóa CartItems cũ
    await CartItem.deleteMany({ cartId: cart._id });

    // Tạo CartItems mới trong collection cartitems
    const cartItemsToCreate = normalizedItems.map(item => ({
      cartId: cart._id,
      itemId: item.productId,
      quantity: item.quantity,
      note: item.note || '',
    }));

    if (cartItemsToCreate.length > 0) {
      await CartItem.insertMany(cartItemsToCreate);
      console.log(`✅ Created ${cartItemsToCreate.length} cart items in cartitems collection`);
    }

    // Lấy lại items để trả về
    const cartItems = await CartItem.find({ cartId: cart._id }).populate('itemId', 'name price image');
    
    const items = cartItems.map(item => ({
      id: item._id.toString(),
      productId: item.itemId?._id?.toString() || '',
      name: item.itemId?.name || '',
      price: item.itemId?.price || 0,
      quantity: item.quantity,
      restaurantId: currentRestaurantId || '',
      restaurantName: currentRestaurantName || '',
      image: item.itemId?.image,
      note: item.note,
    }));

    return res.json({ 
      success: true, 
      data: {
        items,
        total: cart.total,
        currentRestaurantId: cart.currentRestaurantId,
        currentRestaurantName: cart.currentRestaurantName,
      }
    });
  } catch (error) {
    console.error('Upsert cart error:', error);
    return next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.json({ 
        success: true, 
        data: { items: [], total: 0, currentRestaurantId: null, currentRestaurantName: null } 
      });
    }

    // Xóa tất cả CartItems
    await CartItem.deleteMany({ cartId: cart._id });
    console.log('✅ Cleared all cart items from cartitems collection');

    cart.items = [];
    cart.total = 0;
    cart.currentRestaurantId = null;
    cart.currentRestaurantName = null;
    cart.metadata = {
      ...(cart.metadata || {}),
      lastClientUpdate: new Date(),
    };
    await cart.save();

    return res.json({ 
      success: true, 
      data: { items: [], total: 0, currentRestaurantId: null, currentRestaurantName: null } 
    });
  } catch (error) {
    return next(error);
  }
};
