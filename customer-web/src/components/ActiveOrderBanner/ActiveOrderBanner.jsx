import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllOrders,
  subscribeToOrderUpdates,
} from "../../services/orderService";
import "./ActiveOrderBanner.css";

function ActiveOrderBanner() {
  const [activeOrder, setActiveOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkActiveOrder();

    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates(() => {
      checkActiveOrder();
    });

    return unsubscribe;
  }, []);

  const checkActiveOrder = () => {
    const orders = getAllOrders();

    // Tìm order chưa hoàn thành (không phải completed hoặc cancelled)
    const active = orders.find(
      (order) => order.status !== "completed" && order.status !== "cancelled"
    );

    setActiveOrder(active);
  };

  // Không hiển thị banner nếu:
  // - Không có đơn active
  // - Đang ở trang order tracking
  // - Đang ở trang review
  if (
    !activeOrder ||
    location.pathname.includes("/order-tracking") ||
    location.pathname.includes("/review")
  ) {
    return null;
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: { text: "Chờ xác nhận", icon: "⏳", color: "#ffc107" },
      confirmed: { text: "Đã xác nhận", icon: "✅", color: "#28a745" },
      preparing: { text: "Đang chuẩn bị", icon: "👨‍🍳", color: "#17a2b8" },
      ready_for_delivery: {
        text: "Sẵn sàng giao",
        icon: "📦",
        color: "#6610f2",
      },
      delivering: { text: "Đang giao hàng", icon: "🚁", color: "#fd7e14" },
    };
    return statusMap[status] || { text: status, icon: "📋", color: "#6c757d" };
  };

  const statusInfo = getStatusText(activeOrder.status);

  return (
    <div
      className="active-order-banner"
      style={{ borderLeftColor: statusInfo.color }}
    >
      <div className="banner-content">
        <div className="order-info">
          <span className="status-icon">{statusInfo.icon}</span>
          <div className="order-text">
            <div className="order-title">
              Đơn hàng #{activeOrder.id.substring(3, 10)}
            </div>
            <div className="order-status" style={{ color: statusInfo.color }}>
              {statusInfo.text}
            </div>
          </div>
        </div>
        <button
          className="track-btn"
          onClick={() => navigate(`/order-tracking/${activeOrder.id}`)}
        >
          Theo dõi
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default ActiveOrderBanner;
