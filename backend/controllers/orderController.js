import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import { geocodeAddress } from "../utils/geocoding.js";

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

    const isRegisteredCustomer = Boolean(req.user?._id);

    if (!isRegisteredCustomer) {
      if (!customerInfo?.name || !customerInfo?.phone || !customerInfo?.email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp tên, số điện thoại và email để đặt hàng",
        });
      }
    }

    const supportedPaymentMethods = ["momo", "vnpay", "zalopay", "card", "banking", "dronepay"];
    const normalizedPaymentMethod = supportedPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : "momo";
    const paymentProviderMap = {
      momo: "MoMo",
      vnpay: "VNPay",
      zalopay: "ZaloPay",
      card: "Thẻ tín dụng",
      banking: "Chuyển khoản",
      dronepay: "DronePay Gateway",
    };

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

    // Geocode delivery address to get coordinates
    const deliveryCoordinates = geocodeAddress(deliveryAddress);
    const deliveryAddressWithCoords = {
      ...deliveryAddress,
      coordinates: deliveryCoordinates,
    };

    // Generate order number
    const orderNumber = `FD${Date.now()}`;
    const paymentSessionId = `PAY-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const paymentSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const paymentProvider = paymentProviderMap[normalizedPaymentMethod] || "DronePay Gateway";

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
      deliveryAddress: deliveryAddressWithCoords,
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

    // DON'T emit socket event here - only emit after payment confirmation
    // Restaurant should only see orders that have been paid

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
      // Khách hàng chỉ thấy những đơn đã thanh toán thành công
      query.paymentStatus = "paid";
    } else if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhà hàng",
        });
      }
      query.restaurant = restaurant._id;
      // Restaurant sees all orders that have been paid (including paid pending orders)
      query.paymentStatus = 'paid';
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
    const { status: requestedStatus, note } = req.body;

    const status = requestedStatus === 'completed' ? 'delivered' : requestedStatus;

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

    // Create notification for customer
    const Notification = (await import('../models/Notification.js')).default;
    if (order.customer) {
      const statusMessages = {
        confirmed: 'Đơn hàng đã được xác nhận',
        preparing: 'Đơn hàng đang được chuẩn bị',
        ready: 'Đơn hàng sẵn sàng giao',
        delivering: 'Drone đang giao hàng',
        delivered: 'Đơn hàng đã giao thành công',
        cancelled: 'Đơn hàng đã bị hủy',
      };

      const notificationTypeMap = {
        confirmed: 'order_confirmed',
        preparing: 'order_preparing',
        ready: 'order_ready',
        delivering: 'order_delivering',
        delivered: 'order_delivered',
        cancelled: 'order_cancelled',
      };

      const notificationType = notificationTypeMap[status];

      if (notificationType) {
        await Notification.create({
          recipient: order.customer,
          recipientRole: 'customer',
          type: notificationType,
          title: statusMessages[status] || 'Cập nhật đơn hàng',
          message: `Đơn hàng #${order.orderNumber}: ${statusMessages[status] || status}`,
          relatedOrder: order._id,
        });
      }
    }

    // Emit socket event
    if (req.io) {
      if (order.customer) {
        req.io.to(`customer_${order.customer}`).emit("order_updated", populatedOrder);
      }
      req.io.to(`restaurant_${order.restaurant}`).emit("order_updated", populatedOrder);
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

export const confirmThirdPartyPayment = async (req, res) => {
  try {
    const { orderId, sessionId, status, rawData } = req.body;

    if (!orderId || !sessionId || !status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    const order = await Order.findById(orderId).populate('customer restaurant');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (status === 'success') {
      const paidAt = new Date();

      order.paymentStatus = 'paid';
      order.status = 'pending'; // Keep as pending until restaurant confirms
      order.paymentTransaction = {
        transactionId: sessionId,
        paidAt,
        amount: order.total,
        method: order.paymentMethod,
        provider: order.paymentProvider,
      };
      order.timeline.push({
        status: 'pending',
        note: 'Thanh toán thành công, chờ nhà hàng xác nhận',
      });

      // Tạo bản ghi Payment riêng cho thống kê/đối soát
      await Payment.create({
        order: order._id,
        user: order.customer?._id,
        amount: order.total,
        currency: "VND",
        method: order.paymentMethod,
        provider: order.paymentProvider,
        status: "success",
        transactionId: sessionId,
        paidAt,
        rawData: rawData || {},
      });

      // Create notification for customer
      const Notification = (await import('../models/Notification.js')).default;
      if (order.customer) {
        await Notification.create({
          recipient: order.customer._id,
          recipientRole: 'customer',
          type: 'payment_received',
          title: 'Thanh toán thành công',
          message: `Đơn hàng #${order.orderNumber} đã thanh toán thành công, đang chờ nhà hàng xác nhận`,
          relatedOrder: order._id,
        });
      }

      // Create notification for restaurant
      const restaurantOwnerId =
        order.restaurant?.owner?._id || order.restaurant?.owner;
      if (restaurantOwnerId) {
        await Notification.create({
          recipient: restaurantOwnerId,
          recipientRole: 'restaurant',
          type: 'new_order',
          title: 'Đơn hàng mới',
          message: `Bạn có đơn hàng mới #${order.orderNumber} cần xác nhận`,
          relatedOrder: order._id,
        });
      }

      await order.save();

      console.log('✅ Payment confirmed:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentTransaction: order.paymentTransaction,
      });

      // Emit socket events
      if (req.io) {
        if (order.customer) {
          req.io.to(`customer_${order.customer._id}`).emit('order_updated', order);
        }
        req.io.to(`restaurant_${order.restaurant._id}`).emit('new_order', order);
      }

      return res.json({
        success: true,
        message: 'Thanh toán thành công',
        data: order,
      });
    } else {
      // Payment failed - keep order in pending status
      order.paymentStatus = 'failed';
      order.timeline.push({
        status: 'pending',
        note: 'Thanh toán thất bại hoặc bị hủy',
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Thanh toán đã bị hủy',
        data: order,
      });
    }
  } catch (error) {
    console.error('[confirmThirdPartyPayment] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('restaurant', 'name address coordinates')
      .populate('assignedDrone', 'name model currentLocation batteryLevel');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    // Get actual coordinates from order data
    const { getRestaurantCoordinates } = await import('../utils/geocoding.js');
    const restaurantCoords = order.restaurant?.coordinates || getRestaurantCoordinates(order.restaurant);
    const deliveryCoords = order.deliveryAddress?.coordinates;

    if (!deliveryCoords) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy tọa độ địa chỉ giao hàng',
      });
    }

    // Calculate drone position based on order status
    let currentDronePosition = { lat: restaurantCoords.lat, lng: restaurantCoords.lng };
    let progress = 0;

    if (order.status === 'confirmed' || order.status === 'preparing') {
      currentDronePosition = { lat: restaurantCoords.lat, lng: restaurantCoords.lng };
      progress = 0;
    } else if (order.status === 'ready') {
      currentDronePosition = { lat: restaurantCoords.lat, lng: restaurantCoords.lng };
      progress = 10;
    } else if (order.status === 'delivering') {
      // Calculate position along the route
      const elapsed = Date.now() - new Date(order.droneDispatchedAt || order.updatedAt).getTime();
      const estimatedDuration = 20 * 60 * 1000; // 20 minutes
      progress = Math.min(90, 10 + (elapsed / estimatedDuration) * 80);

      const ratio = (progress - 10) / 80;
      currentDronePosition = {
        lat: restaurantCoords.lat + (deliveryCoords.lat - restaurantCoords.lat) * ratio,
        lng: restaurantCoords.lng + (deliveryCoords.lng - restaurantCoords.lng) * ratio,
      };
    } else if (order.status === 'delivered') {
      currentDronePosition = { lat: deliveryCoords.lat, lng: deliveryCoords.lng };
      progress = 100;
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          timeline: order.timeline,
        },
        tracking: {
          pickupLocation: {
            name: order.restaurant?.name,
            address: order.restaurant?.address,
            coordinates: restaurantCoords,
          },
          deliveryLocation: {
            address: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.ward}, ${order.deliveryAddress?.district}, ${order.deliveryAddress?.city}`,
            coordinates: deliveryCoords,
          },
          droneLocation: currentDronePosition,
          progress: progress,
          estimatedArrival: order.estimatedDeliveryTime,
          drone: order.assignedDrone ? {
            name: order.assignedDrone.name,
            model: order.assignedDrone.model,
            batteryLevel: order.assignedDrone.batteryLevel,
          } : null,
        },
      },
    });
  } catch (error) {
    console.error('[trackOrder] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate('customer restaurant');

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

    // Create notification
    const Notification = (await import('../models/Notification.js')).default;
    if (order.customer) {
      await Notification.create({
        recipient: order.customer._id,
        recipientRole: 'customer',
        type: 'order_cancelled',
        title: 'Đơn hàng đã bị hủy',
        message: `Đơn hàng #${order.orderNumber} đã bị hủy: ${reason}`,
        relatedOrder: order._id,
      });
    }

    // Emit socket event
    if (req.io) {
      if (order.customer) {
        req.io.to(`customer_${order.customer._id}`).emit("order_cancelled", order);
      }
      req.io.to(`restaurant_${order.restaurant._id}`).emit("order_cancelled", order);
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
