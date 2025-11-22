import Order from "../models/Order.js";
import vnpayService from "../services/vnpayService.js";
import momoService from "../services/momoService.js";

// Create VNPay payment URL
export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Get client IP
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Create payment URL
    const paymentUrl = vnpayService.createPaymentUrl(
      orderId,
      amount,
      orderInfo || `Thanh toán đơn hàng ${order.orderNumber}`,
      ipAddr
    );

    // Update order with payment session
    order.paymentMethod = "banking";
    order.paymentProvider = "VNPay";
    order.paymentSessionId = orderId;
    order.paymentSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await order.save();

    res.json({
      success: true,
      data: {
        paymentUrl,
        orderId,
      },
    });
  } catch (error) {
    console.error("VNPay Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle VNPay return callback
export const vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Verify signature
    const isValid = vnpayService.verifyReturnUrl(vnpParams);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Chữ ký không hợp lệ",
      });
    }

    const orderId = vnpParams.vnp_TxnRef.split("_")[0];
    const responseCode = vnpParams.vnp_ResponseCode;

    const order = await Order.findById(orderId)
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (responseCode === "00") {
      // Payment success
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.timeline.push({
        status: "confirmed",
        note: "Thanh toán VNPay thành công",
        timestamp: new Date(),
      });
    } else {
      // Payment failed
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "payment_failed",
        note: `Thanh toán VNPay thất bại (Mã: ${responseCode})`,
        timestamp: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      data: {
        order,
        paymentStatus: responseCode === "00" ? "success" : "failed",
        message:
          responseCode === "00"
            ? "Thanh toán thành công"
            : "Thanh toán thất bại",
      },
    });
  } catch (error) {
    console.error("VNPay Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create MoMo payment
export const createMoMoPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin thanh toán",
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Create MoMo payment
    const momoResponse = await momoService.createPayment(
      orderId,
      amount,
      orderInfo || `Thanh toán đơn hàng ${order.orderNumber}`,
      "" // extraData
    );

    if (momoResponse.resultCode !== 0) {
      return res.status(400).json({
        success: false,
        message: momoResponse.message || "Không thể tạo thanh toán MoMo",
      });
    }

    // Update order with payment session
    order.paymentMethod = "momo";
    order.paymentProvider = "MoMo";
    order.paymentSessionId = momoResponse.requestId;
    order.paymentSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await order.save();

    res.json({
      success: true,
      data: {
        paymentUrl: momoResponse.payUrl,
        orderId,
        requestId: momoResponse.requestId,
      },
    });
  } catch (error) {
    console.error("MoMo Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle MoMo return callback
export const momoReturn = async (req, res) => {
  try {
    const momoParams = req.query;

    // Verify signature
    const isValid = momoService.verifySignature(momoParams);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Chữ ký không hợp lệ",
      });
    }

    const orderId = momoParams.orderId;
    const resultCode = parseInt(momoParams.resultCode);

    const order = await Order.findById(orderId)
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (resultCode === 0) {
      // Payment success
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.timeline.push({
        status: "confirmed",
        note: "Thanh toán MoMo thành công",
        timestamp: new Date(),
      });
    } else {
      // Payment failed
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "payment_failed",
        note: `Thanh toán MoMo thất bại (Mã: ${resultCode})`,
        timestamp: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      data: {
        order,
        paymentStatus: resultCode === 0 ? "success" : "failed",
        message:
          momoParams.message ||
          (resultCode === 0 ? "Thanh toán thành công" : "Thanh toán thất bại"),
      },
    });
  } catch (error) {
    console.error("MoMo Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Handle MoMo IPN (webhook)
export const momoIPN = async (req, res) => {
  try {
    const momoParams = req.body;

    // Verify signature
    const isValid = momoService.verifySignature(momoParams);

    if (!isValid) {
      return res.status(204).end(); // MoMo requires 204 for invalid signature
    }

    const orderId = momoParams.orderId;
    const resultCode = parseInt(momoParams.resultCode);

    const order = await Order.findById(orderId);

    if (order && resultCode === 0) {
      order.paymentStatus = "paid";
      if (order.status === "pending") {
        order.status = "confirmed";
      }
      await order.save();
    }

    res.status(204).end();
  } catch (error) {
    console.error("MoMo IPN Error:", error);
    res.status(204).end();
  }
};

export const confirmThirdPartyPayment = async (req, res) => {
  try {
    const { orderId, sessionId, status } = req.body;

    if (!orderId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu orderId hoặc sessionId",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (!order.paymentSessionId || order.paymentSessionId !== sessionId) {
      return res.status(400).json({
        success: false,
        message: "Phiên thanh toán không hợp lệ",
      });
    }

    const normalizedStatus = status === "success" ? "paid" : "failed";

    order.paymentStatus = normalizedStatus;
    order.timeline.push({
      status: normalizedStatus === "paid" ? "confirmed" : "payment_failed",
      note:
        normalizedStatus === "paid"
          ? "Thanh toán trực tuyến đã hoàn tất"
          : "Thanh toán trực tuyến thất bại",
      timestamp: new Date(),
    });

    if (normalizedStatus === "paid" && order.status === "pending") {
      order.status = "confirmed";
    }

    await order.save();

    let orderQuery = Order.findById(order._id)
      .populate("restaurant", "name phone address")
      .populate("items.product", "name image");

    if (order.customer) {
      orderQuery = orderQuery.populate("customer", "name phone");
    }

    const populatedOrder = await orderQuery;

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
