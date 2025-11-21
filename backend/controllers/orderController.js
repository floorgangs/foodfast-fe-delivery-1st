import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      customerNote,
    } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      let itemPrice = product.price;

      // Add options price
      if (item.options && item.options.length > 0) {
        item.options.forEach((opt) => {
          itemPrice += opt.price || 0;
        });
      }

      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        options: item.options || [],
        specialInstructions: item.specialInstructions,
      });
    }

    const deliveryFee = restaurant.deliveryFee || 15000;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      customerNote,
      timeline: [
        {
          status: "pending",
          note: "Đơn hàng đã được tạo",
        },
      ],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    // Emit socket event (sẽ thêm sau)
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`restaurant_${restaurantId}`)
        .emit("new_order", populatedOrder);
      req.app.get("io").to("admin").emit("new_order", populatedOrder);
    }

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, restaurantId } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === "customer") {
      query.customer = req.user._id;
    } else if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng",
        });
      }
      query.restaurant = restaurant._id;
    }
    // Admin can see all orders

    if (status) {
      query.status = status;
    }

    if (restaurantId && req.user.role === "admin") {
      query.restaurant = restaurantId;
    }

    const orders = await Order.find(query)
      .populate("customer", "name phone avatar")
      .populate("restaurant", "name phone address avatar")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name phone avatar")
      .populate("restaurant", "name phone address avatar")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check access rights
    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này",
      });
    }

    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (
        !restaurant ||
        order.restaurant._id.toString() !== restaurant._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này",
        });
      }
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check permissions
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (
        !restaurant ||
        order.restaurant.toString() !== restaurant._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này",
        });
      }
    }

    order.status = status;
    order.timeline.push({
      status,
      note: note || `Đơn hàng ${status}`,
    });

    if (status === "delivered") {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    // Emit socket event
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`customer_${order.customer}`)
        .emit("order_updated", populatedOrder);
      req.app
        .get("io")
        .to(`restaurant_${order.restaurant}`)
        .emit("order_updated", populatedOrder);
      req.app.get("io").to("admin").emit("order_updated", populatedOrder);
    }

    res.json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng đang giao",
      });
    }

    order.status = "cancelled";
    order.cancelReason = reason;
    order.timeline.push({
      status: "cancelled",
      note: `Đơn hàng đã bị hủy: ${reason}`,
    });

    await order.save();

    // Emit socket event
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`restaurant_${order.restaurant}`)
        .emit("order_cancelled", order);
      req.app.get("io").to("admin").emit("order_cancelled", order);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
