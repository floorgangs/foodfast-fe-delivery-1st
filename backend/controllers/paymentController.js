import Order from "../models/Order.js";

// Confirm third party payment (used by PayPal)
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
          ? "Thanh toán PayPal đã hoàn tất"
          : "Thanh toán PayPal thất bại",
      timestamp: new Date(),
    });

    if (normalizedStatus === "paid" && order.status === "pending") {
      order.status = "confirmed";
    }

    await order.save();

    // Emit socket event to restaurant
    if (normalizedStatus === "paid") {
      const io = req.app.get("io");
      if (io) {
        io.to(`restaurant_${order.restaurant._id || order.restaurant}`).emit(
          "new_order",
          {
            order,
            message: "Có đơn hàng mới đã thanh toán PayPal!",
          }
        );
        console.log(
          `🔔 Emitted new_order event to restaurant_${
            order.restaurant._id || order.restaurant
          }`
        );
      }
    }

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
