import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const {
      restaurant: restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      note: customerNote,
      voucherCode,
      subtotal: clientSubtotal,
      deliveryFee: clientDeliveryFee,
      discount: clientDiscount,
      totalAmount: clientTotal,
      customerInfo,
    } = req.body;

    console.log("📝 Order request:", {
      isAuthenticated: Boolean(req.user?._id),
      hasCustomer: Boolean(req.body.customer),
      hasCustomerInfo: Boolean(customerInfo),
      customerInfo,
    });

    const isRegisteredCustomer = Boolean(req.user?._id);

    if (!isRegisteredCustomer) {
      if (!customerInfo?.name || !customerInfo?.phone) {
        console.log("❌ Guest order missing info");
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp tên và số điện thoại để đặt hàng",
        });
      }
    }

    const normalizedPaymentMethod = "dronepay";
    if (paymentMethod && paymentMethod !== "dronepay") {
      console.warn(
        `[Order] Override payment method ${paymentMethod} -> dronepay để đáp ứng chính sách online`
      );
    }

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Calculate totals server-side for security
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      let itemPrice = item.price || product.price;

      // Add options price if exists
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

    const deliveryFee = clientDeliveryFee || restaurant.deliveryFee || 15000;
    const discount = clientDiscount || 0;
    const total = subtotal + deliveryFee - discount;

    // Generate order number
    const orderNumber = `FD${Date.now()}`;
    const paymentSessionId = `PAY-${Date.now()}-${Math.floor(
      Math.random() * 9999
    )}`;
    const paymentSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const paymentProvider = "DronePay Gateway";

    const order = await Order.create({
      orderNumber,
      customer: req.user?._id,
      customerType: isRegisteredCustomer ? "registered" : "guest",
      guestCustomer: isRegisteredCustomer
        ? undefined
        : {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email,
          },
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentProvider,
      paymentSessionId,
      paymentSessionExpiresAt,
      customerNote,
      voucherCode,
      status: "pending",
      timeline: [
        {
          status: "pending",
          note: "Đơn hàng đã được tạo",
          timestamp: new Date(),
        },
      ],
    });

    let orderQuery = Order.findById(order._id)
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    if (order.customer) {
      orderQuery = orderQuery.populate("customer", "name phone");
    }

    const populatedOrder = await orderQuery;

    // Emit socket event to restaurant and admin
    if (req.io) {
      req.io.to(`restaurant_${restaurantId}`).emit("new_order", populatedOrder);
      req.io.to("admin").emit("new_order", populatedOrder);
    }

    res.status(201).json({
      success: true,
      data: populatedOrder,
      paymentSession: {
        sessionId: paymentSessionId,
        providerName: paymentProvider,
        amount: total,
        expiresAt: paymentSessionExpiresAt,
        redirectUrl:
          process.env.THIRD_PARTY_PAYMENT_URL ||
          `https://dronepay.foodfast.dev/session/${paymentSessionId}`,
      },
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
    if (req.io) {
      if (order.customer) {
        req.io
          .to(`customer_${order.customer}`)
          .emit("order_updated", populatedOrder);
      }
      req.io
        .to(`restaurant_${order.restaurant}`)
        .emit("order_updated", populatedOrder);
      req.io.to("admin").emit("order_updated", populatedOrder);
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
    if (req.io) {
      if (order.customer) {
        req.io.to(`customer_${order.customer}`).emit("order_cancelled", order);
      }
      req.io
        .to(`restaurant_${order.restaurant}`)
        .emit("order_cancelled", order);
      req.io.to("admin").emit("order_cancelled", order);
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
