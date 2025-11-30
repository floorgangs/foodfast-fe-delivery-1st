import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { orderAPI } from "../../services/api";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      const data = response?.data ?? response;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng giao",
      delivering: "Đang giao",
      delivered: "Đã giao",
      completed: "Đã giao", // Customer sees completed as "Đã giao"
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#FFA500",
      confirmed: "#4CAF50",
      preparing: "#2196F3",
      ready: "#9C27B0",
      delivering: "#FF9800",
      delivered: "#4CAF50",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return colorMap[status] || "#999";
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active")
      return [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivering",
      ].includes(order.status);
    if (activeTab === "history")
      return ["delivered", "completed", "cancelled"].includes(order.status);
    return true;
  });

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading">Đang tải đơn hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Đơn hàng của tôi</h1>

        <div className="tabs">
          <button
            className={activeTab === "active" ? "active" : ""}
            onClick={() => setActiveTab("active")}
          >
            Đang xử lý
            <span className="tab-count">
              {
                orders.filter((o) =>
                  [
                    "pending",
                    "confirmed",
                    "preparing",
                    "ready",
                    "delivering",
                  ].includes(o.status)
                ).length
              }
            </span>
          </button>
          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            Lịch sử
            <span className="tab-count">
              {
                orders.filter((o) =>
                  ["delivered", "completed", "cancelled"].includes(o.status)
                ).length
              }
            </span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có đơn hàng nào</h3>
            <p>Hãy đặt món ngay để thưởng thức!</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="order-card"
                onClick={() => navigate(`/order-tracking/${order._id}`)}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Đơn hàng #{order.orderNumber}</h3>
                    <p className="restaurant-name">
                      {typeof order.restaurant === "object"
                        ? order.restaurant?.name
                        : "Nhà hàng"}
                    </p>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      {item.product?.image && (
                        <img 
                          src={item.product.image} 
                          alt={item.name} 
                          className="item-image"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="more-items">
                      +{order.items.length - 3} món khác
                    </p>
                  )}
                </div>

                <div className="order-footer">
                  <span className="order-date">
                    🕐 {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="order-total">
                    {order.total?.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
