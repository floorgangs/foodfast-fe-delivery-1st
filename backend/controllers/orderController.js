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

    const supportedPaymentMethods = ["paypal"];
    
    if (!supportedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ hỗ trợ thanh toán qua PayPal",
      });
    }
    
    const normalizedPaymentMethod = paymentMethod;
    const paymentProviderMap = {
      paypal: "PayPal",
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

    const normalizeCoordinateValue = (value) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    const normalizeCoordinates = (coords) => {
      if (!coords) {
        return null;
      }

      if (Array.isArray(coords)) {
        const latFromArray = normalizeCoordinateValue(coords[0]);
        const lngFromArray = normalizeCoordinateValue(coords[1]);
        if (latFromArray == null || lngFromArray == null) {
          return null;
        }
        return { lat: latFromArray, lng: lngFromArray };
      }

      const lat = normalizeCoordinateValue(
        coords.lat ?? coords.latitude ?? coords.y
      );
      const lng = normalizeCoordinateValue(
        coords.lng ?? coords.lon ?? coords.longitude ?? coords.x
      );

      if (lat == null || lng == null) {
        return null;
      }

      return { lat, lng };
    };

    const normalizeDeliveryAddressInput = (input) => {
      const raw =
        typeof input === "string" ? { address: input } : { ...(input || {}) };

      const normalized = {
        label: raw.label || raw.name || raw.title,
        street:
          raw.street ||
          raw.streetName ||
          raw.address ||
          raw.addressLine ||
          raw.detailAddress ||
          raw.detail ||
          "",
        address:
          raw.address ||
          raw.addressLine ||
          raw.street ||
          raw.streetName ||
          raw.detailAddress ||
          raw.detail ||
          "",
        ward:
          raw.ward || raw.subdistrict || raw.wardName || raw.neighborhood || "",
        district:
          raw.district || raw.county || raw.districtName || raw.locality || "",
        city:
          raw.city ||
          raw.province ||
          raw.cityName ||
          raw.state ||
          "Hồ Chí Minh",
        phone:
          raw.phone || raw.contactPhone || customerInfo?.phone || undefined,
        note: raw.note || raw.instructions,
      };

      if (!normalized.street && normalized.address) {
        normalized.street = normalized.address;
      }

      if (!normalized.address && normalized.street) {
        normalized.address = normalized.street;
      }

      if (raw.postalCode) {
        normalized.postalCode = raw.postalCode;
      }

      const coordinateCandidate =
        raw.coordinates ||
        (raw.location && (raw.location.coordinates || raw.location)) ||
        (raw.lat != null ||
        raw.latitude != null ||
        raw.lng != null ||
        raw.longitude != null
          ? {
              lat: raw.lat ?? raw.latitude,
              lng: raw.lng ?? raw.longitude ?? raw.lon,
            }
          : null);

      const normalizedCoordinates = normalizeCoordinates(coordinateCandidate);
      if (normalizedCoordinates) {
        normalized.coordinates = normalizedCoordinates;
      }

      return normalized;
    };

    const normalizedDeliveryAddress =
      normalizeDeliveryAddressInput(deliveryAddress);

    let deliveryCoordinates = normalizeCoordinates(
      normalizedDeliveryAddress.coordinates
    );

    if (!deliveryCoordinates) {
      const geocodedDelivery = geocodeAddress(normalizedDeliveryAddress);
      deliveryCoordinates =
        normalizeCoordinates(geocodedDelivery) || geocodedDelivery || null;
    }

    if (deliveryCoordinates) {
      normalizedDeliveryAddress.coordinates = deliveryCoordinates;
    } else {
      delete normalizedDeliveryAddress.coordinates;
    }

    console.log(
      "[createOrder] normalizedDeliveryAddress:",
      normalizedDeliveryAddress
    );

    // Generate order number
    const orderNumber = `FD${Date.now()}`;
    const paymentSessionId = `PAY-${Date.now()}-${Math.floor(
      Math.random() * 9999
    )}`;
    const paymentSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const paymentProvider = paymentProviderMap[normalizedPaymentMethod] || "PayPal";

    // All orders require online payment via PayPal
    const initialPaymentStatus = "pending";
    const initialOrderStatus = "pending";

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
      deliveryAddress: normalizedDeliveryAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentProvider: paymentProvider,
      paymentStatus: initialPaymentStatus,
      paymentSessionId,
      paymentSessionExpiresAt,
      customerNote,
      voucherCode,
      status: initialOrderStatus,
      timeline: [
        {
          status: initialOrderStatus,
          note: "Đơn hàng đã được tạo, chờ thanh toán PayPal",
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

    // No socket event here - only after payment is confirmed

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
      query.paymentStatus = "paid";
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

    const status =
      requestedStatus === "completed" ? "delivered" : requestedStatus;

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

    // When order status becomes "delivering", assign a drone and update its status
    if (status === "delivering" && !order.drone) {
      const Drone = (await import("../models/Drone.js")).default;
      const Delivery = (await import("../models/Delivery.js")).default;
      
      const availableDrone = await Drone.findOne({ status: "available" }).sort({
        batteryLevel: -1,
      });

      console.log('🔍 Looking for available drone...', availableDrone ? `Found: ${availableDrone._id}` : 'No drone available');

      if (availableDrone) {
        availableDrone.status = "delivering";
        availableDrone.currentOrder = order._id;
        await availableDrone.save();

        order.drone = availableDrone._id;
        order.droneDeliveryDetails = {
          assignedAt: new Date(),
          launchedAt: new Date(),
        };

        console.log('✅ Drone assigned:', availableDrone._id);
      } else {
        console.log('⚠️ No available drone found, creating Delivery without drone');
      }

      // Create Delivery record (with or without drone)
      try {
        const deliveryId = `DEL-${order._id}-${Date.now()}`;
        
        // Get restaurant info - need to populate first
        const populatedOrder = await Order.findById(order._id).populate('restaurant');
        
        // Get restaurant location from populated restaurant or use default
        const restaurantLocation = populatedOrder.restaurant?.location?.coordinates || 
                                   [106.660172, 10.762622]; // Default HCM
        
        // Get delivery address coordinates
        const deliveryCoords = order.deliveryAddress?.coordinates?.lat && order.deliveryAddress?.coordinates?.lng
          ? [order.deliveryAddress.coordinates.lng, order.deliveryAddress.coordinates.lat]
          : [106.660172, 10.762622]; // Default

        console.log('📍 Restaurant location:', restaurantLocation);
        console.log('📍 Delivery location:', deliveryCoords);

        const newDelivery = await Delivery.create({
          deliveryId,
          orderId: order._id,
          droneId: availableDrone?._id || null,
          startLocation: {
            type: "Point",
            coordinates: Array.isArray(restaurantLocation) ? restaurantLocation : [106.660172, 10.762622],
            address: populatedOrder.restaurant?.address || '',
          },
          endLocation: {
            type: "Point",
            coordinates: deliveryCoords,
            address: order.deliveryAddress?.address || order.deliveryAddress?.street || '',
          },
          status: "in_transit",
        });

        console.log('✅ Delivery created:', newDelivery._id, 'deliveryId:', deliveryId);
      } catch (deliveryError) {
        console.error('❌ Error creating Delivery:', deliveryError.message);
        console.error('Delivery validation errors:', deliveryError.errors);
      }
    }

    // When order is delivered, free up the drone
    if (status === "delivered" && order.drone) {
      const Drone = (await import("../models/Drone.js")).default;
      const Delivery = (await import("../models/Delivery.js")).default;
      
      const drone = await Drone.findById(order.drone);
      if (drone) {
        drone.status = "available";
        drone.currentOrder = null;
        await drone.save();
      }

      // Update Delivery status
      await Delivery.findOneAndUpdate(
        { orderId: order._id },
        { 
          status: "delivered",
          deliveredAt: new Date(),
        }
      );

      console.log('✅ Delivery completed for order:', order._id);
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    // Create notification for customer
    const Notification = (await import("../models/Notification.js")).default;
    if (order.customer) {
      const statusMessages = {
        confirmed: "Đơn hàng đã được xác nhận",
        preparing: "Đơn hàng đang được chuẩn bị",
        ready: "Đơn hàng sẵn sàng giao",
        delivering: "Drone đang giao hàng",
        delivered: "Đơn hàng đã giao thành công",
        cancelled: "Đơn hàng đã bị hủy",
      };

      const notificationTypeMap = {
        confirmed: "order_confirmed",
        preparing: "order_preparing",
        ready: "order_ready",
        delivering: "order_delivering",
        delivered: "order_delivered",
        cancelled: "order_cancelled",
      };

      const notificationType = notificationTypeMap[status];

      if (notificationType) {
        await Notification.create({
          recipient: order.customer,
          recipientRole: "customer",
          type: notificationType,
          title: statusMessages[status] || "Cập nhật đơn hàng",
          message: `Đơn hàng #${order.orderNumber}: ${
            statusMessages[status] || status
          }`,
          relatedOrder: order._id,
        });
      }
    }

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

export const confirmThirdPartyPayment = async (req, res) => {
  try {
    const { orderId, sessionId, status, rawData } = req.body;

    console.log("[confirmThirdPartyPayment] Request body:", {
      orderId,
      sessionId,
      status,
    });

    if (!orderId || !sessionId || !status) {
      console.error("[confirmThirdPartyPayment] Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    const order = await Order.findById(orderId).populate("customer restaurant");

    if (!order) {
      console.error("[confirmThirdPartyPayment] Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    console.log("[confirmThirdPartyPayment] Order found:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      paymentStatus: order.paymentStatus,
      paymentSessionId: order.paymentSessionId,
    });

    if (status === "success") {
      // Check if order is already paid
      if (order.paymentStatus === 'paid') {
         console.log(`[confirmThirdPartyPayment] Order ${order.orderNumber} already paid, returning success`);
         return res.json({
            success: true,
            message: "Thanh toán thành công (đã ghi nhận trước đó)",
            data: order,
         });
      }

      const paidAt = new Date();

      order.paymentStatus = "paid";
      order.status = "pending"; // Keep as pending until restaurant confirms
      order.paymentTransaction = {
        transactionId: sessionId,
        paidAt,
        amount: order.total,
        method: order.paymentMethod,
        provider: order.paymentProvider,
      };
      order.timeline.push({
        status: "pending",
        note: "Thanh toán thành công, chờ nhà hàng xác nhận",
      });

      // Tạo bản ghi Payment riêng cho thống kê/đối soát
      // Check if payment already exists to avoid duplicate key error
      const existingPayment = await Payment.findOne({ paymentId: sessionId });
      
      if (!existingPayment) {
        await Payment.create({
          paymentId: sessionId,
          order: order._id,
          customer: order.customer?._id,
          amount: order.total,
          currency: "VND",
          method: order.paymentMethod || "momo",
          provider: order.paymentProvider,
          status: "completed",
          transactionId: sessionId,
          paidAt,
          rawData: rawData || {},
        });
      } else {
        console.log(`[confirmThirdPartyPayment] Payment record already exists for session ${sessionId}`);
      }

      // Create notification for customer
      const Notification = (await import("../models/Notification.js")).default;
      if (order.customer) {
        await Notification.create({
          recipient: order.customer._id,
          recipientRole: "customer",
          type: "payment_received",
          title: "Thanh toán thành công",
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
          recipientRole: "restaurant",
          type: "new_order",
          title: "Đơn hàng mới",
          message: `Bạn có đơn hàng mới #${order.orderNumber} cần xác nhận`,
          relatedOrder: order._id,
        });
      }

      await order.save();

      console.log("✅ Payment confirmed:", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentTransaction: order.paymentTransaction,
      });

      // Emit socket events
      if (req.io) {
        if (order.customer) {
          req.io
            .to(`customer_${order.customer._id}`)
            .emit("order_updated", order);
        }
        req.io
          .to(`restaurant_${order.restaurant._id}`)
          .emit("new_order", order);
      }

      return res.json({
        success: true,
        message: "Thanh toán thành công",
        data: order,
      });
    } else {
      // Payment failed - keep order in pending status
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "pending",
        note: "Thanh toán thất bại hoặc bị hủy",
      });
      await order.save();

      return res.json({
        success: true,
        message: "Thanh toán đã bị hủy",
        data: order,
      });
    }
  } catch (error) {
    console.error("[confirmThirdPartyPayment] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("restaurant", "name address coordinates")
      .populate(
        "drone",
        "droneId name model status batteryLevel currentLocation"
      )
      .populate("items.product", "name image price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const { getRestaurantCoordinates, geocodeAddress, buildAddressString } =
      await import("../utils/geocoding.js");
    const normalizeCoordinateValue = (value) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    const normalizeCoordinates = (coords) => {
      if (!coords) {
        return null;
      }
      const lat = normalizeCoordinateValue(coords.lat ?? coords.latitude);
      const lng = normalizeCoordinateValue(
        coords.lng ?? coords.lon ?? coords.longitude
      );
      if (lat == null || lng == null) {
        return null;
      }
      return { lat, lng };
    };

    const restaurantCoords =
      normalizeCoordinates(order.restaurant?.coordinates) ||
      normalizeCoordinates(order.restaurant?.address?.coordinates) ||
      getRestaurantCoordinates(order.restaurant || {});

    let deliveryCoords = normalizeCoordinates(
      order.deliveryAddress?.coordinates
    );

    if (!deliveryCoords?.lat || !deliveryCoords?.lng) {
      const geocodedDelivery = geocodeAddress(
        order.deliveryAddress || order.deliveryAddress?.address
      );
      if (geocodedDelivery) {
        deliveryCoords =
          normalizeCoordinates(geocodedDelivery) || geocodedDelivery;
      }
    }

    console.log("[trackOrder] deliveryAddress stored:", order.deliveryAddress);
    console.log("[trackOrder] resolved deliveryCoords:", deliveryCoords);

    if (!deliveryCoords?.lat || !deliveryCoords?.lng) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy tọa độ địa chỉ giao hàng",
      });
    }

    const normalizeStatus = (status) => {
      if (!status) return "pending";
      if (status === "completed") return "delivered";
      return status;
    };

    const statusSequence = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivering",
      "delivered",
    ];
    const currentStatus = normalizeStatus(order.status);
    const statusIndex = Math.max(statusSequence.indexOf(currentStatus), 0);
    const progress =
      statusSequence.length > 1 ? statusIndex / (statusSequence.length - 1) : 0;

    const buildFullAddress = (address) => buildAddressString(address);

    const persistedLocation = order.droneDeliveryDetails?.currentLocation;
    const normalizedPersistedDrone = normalizeCoordinates(persistedLocation);
    const droneLocationFromOrder = normalizedPersistedDrone
      ? {
          lat: normalizedPersistedDrone.lat,
          lng: normalizedPersistedDrone.lng,
          heading: persistedLocation.heading,
          updatedAt: persistedLocation.updatedAt,
        }
      : null;

    const normalizedDroneLocation = normalizeCoordinates(
      order.drone?.currentLocation
    );
    const droneLocationFromDrone = normalizedDroneLocation
      ? {
          lat: normalizedDroneLocation.lat,
          lng: normalizedDroneLocation.lng,
          heading: undefined,
          updatedAt: order.drone.updatedAt,
        }
      : null;

    const defaultDroneLocation =
      currentStatus === "delivered"
        ? { lat: deliveryCoords.lat, lng: deliveryCoords.lng }
        : { lat: restaurantCoords.lat, lng: restaurantCoords.lng };

    const droneLocation =
      droneLocationFromOrder || droneLocationFromDrone || defaultDroneLocation;

    const toRadians = (deg) => (deg * Math.PI) / 180;
    const haversineDistance = (pointA, pointB) => {
      if (!pointA || !pointB) return 0;
      const earthRadius = 6371e3; // metres
      const dLat = toRadians(pointB.lat - pointA.lat);
      const dLng = toRadians(pointB.lng - pointA.lng);
      const lat1 = toRadians(pointA.lat);
      const lat2 = toRadians(pointB.lat);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadius * c;
    };

    const calculateFlightProgress = () => {
      if (currentStatus === "delivered") {
        return 1;
      }
      if (currentStatus !== "delivering") {
        return 0;
      }
      const totalDistance = haversineDistance(restaurantCoords, deliveryCoords);
      if (!totalDistance) {
        return 0;
      }
      const travelled = haversineDistance(restaurantCoords, droneLocation);
      return Math.min(Math.max(travelled / totalDistance, 0), 1);
    };

    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: currentStatus,
          timeline: order.timeline,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items.map((item) => ({
            id: item._id,
            quantity: item.quantity,
            price: item.price,
            name: item.name || item.product?.name,
            product: item.product?._id || item.product,
          })),
        },
        tracking: {
          pickupLocation: {
            name: order.restaurant?.name,
            address: buildAddressString(
              order.restaurant?.address || order.restaurant
            ),
            coordinates: restaurantCoords,
          },
          deliveryLocation: {
            address: buildFullAddress(order.deliveryAddress),
            coordinates: deliveryCoords,
          },
          droneLocation,
          progress,
          flightProgress: calculateFlightProgress(),
          estimatedArrival: order.estimatedDeliveryTime,
          updatedAt: new Date(),
          drone: order.drone
            ? {
                id: order.drone._id,
                droneId: order.drone.droneId,
                name: order.drone.name,
                model: order.drone.model,
                status: order.drone.status,
                batteryLevel: order.drone.batteryLevel,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("[trackOrder] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "customer restaurant"
    );

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
    const Notification = (await import("../models/Notification.js")).default;
    if (order.customer) {
      await Notification.create({
        recipient: order.customer._id,
        recipientRole: "customer",
        type: "order_cancelled",
        title: "Đơn hàng đã bị hủy",
        message: `Đơn hàng #${order.orderNumber} đã bị hủy: ${reason}`,
        relatedOrder: order._id,
      });
    }

    // Emit socket event
    if (req.io) {
      if (order.customer) {
        req.io
          .to(`customer_${order.customer._id}`)
          .emit("order_cancelled", order);
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

// Customer completes order
export const completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Only customer can complete their own order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xác nhận đơn hàng này",
      });
    }

    // Order must be delivered first
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xác nhận đơn hàng đã được giao",
      });
    }

    order.status = "completed";
    order.completedAt = new Date();
    order.timeline.push({
      status: "completed",
      note: "Khách hàng đã xác nhận nhận hàng",
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    // Emit socket event
    if (req.io) {
      req.io
        .to(`restaurant_${order.restaurant}`)
        .emit("order_completed", populatedOrder);
      req.io.to("admin").emit("order_completed", populatedOrder);
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

// Customer confirms drone delivery (delivered status)
export const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Only customer can confirm delivery of their own order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xác nhận đơn hàng này",
      });
    }

    // Order must be in delivering status
    if (order.status !== "delivering") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xác nhận khi đơn hàng đang được giao",
      });
    }

    order.status = "delivered";
    order.actualDeliveryTime = new Date();
    order.timeline.push({
      status: "delivered",
      note: "Drone đã giao hàng thành công",
    });

    // Free up the drone
    if (order.drone) {
      const Drone = (await import("../models/Drone.js")).default;
      const Delivery = (await import("../models/Delivery.js")).default;
      
      const drone = await Drone.findById(order.drone);
      if (drone) {
        drone.status = "available";
        drone.currentOrder = null;
        await drone.save();
      }

      // Update Delivery status
      await Delivery.findOneAndUpdate(
        { orderId: order._id },
        { 
          status: "delivered",
          deliveredAt: new Date(),
        }
      );
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    // Create notification for customer
    const Notification = (await import("../models/Notification.js")).default;
    if (order.customer) {
      await Notification.create({
        recipient: order.customer,
        recipientRole: "customer",
        type: "order_delivered",
        title: "Đơn hàng đã giao thành công",
        message: `Đơn hàng #${order.orderNumber}: Drone đã giao hàng thành công`,
        relatedOrder: order._id,
      });
    }

    // Emit socket event
    if (req.io) {
      req.io
        .to(`restaurant_${order.restaurant}`)
        .emit("order_delivered", populatedOrder);
      req.io.to("admin").emit("order_delivered", populatedOrder);
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
