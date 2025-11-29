import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderAPI } from "../../services/api";
import "./Profile.css";

function Profile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current"); // current or history

  // Check for tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'history') {
      setActiveTab('history');
    }
  }, [searchParams]);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      const data = response?.data ?? response;
      // Sort by created date (newest first)
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const currentOrders = orders.filter(
    (order) => !["delivered", "completed", "cancelled"].includes(order.status)
  );

  const historyOrders = orders.filter(
    (order) => ["delivered", "completed", "cancelled"].includes(order.status)
  );

  const getStatusText = (status) => {
    const statusMap = {
      pending: "⏳ Chờ xác nhận",
      confirmed: "✅ Đã xác nhận",
      preparing: "👨‍🍳 Đang chuẩn bị",
      ready: "📦 Sẵn sàng giao",
      ready_for_delivery: "📦 Sẵn sàng giao",
      delivering: "🚁 Đang giao hàng",
      delivered: "✔️ Đã giao",
      completed: "✔️ Đã giao", // Customer sees this as 'delivered'
      cancelled: "❌ Đã hủy",
    };
    return statusMap[status] || status;
  };

  const displayOrders = activeTab === "current" ? currentOrders : historyOrders;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2>{user?.name}</h2>
              <p className="user-email">{user?.email}</p>
              <p className="user-phone">{user?.phone || ""}</p>
            </div>

            <nav className="profile-menu">
              <button
                className="menu-item"
                onClick={() => navigate("/edit-profile")}
              >
                <span className="menu-icon">👤</span>
                <span className="menu-text">Thông tin cá nhân</span>
              </button>
              <button
                className="menu-item"
                onClick={() => navigate("/delivery-addresses")}
              >
                <span className="menu-icon">📍</span>
                <span className="menu-text">Địa chỉ giao hàng</span>
              </button>
              <button
                className="menu-item"
                onClick={() => navigate("/payment-methods")}
              >
                <span className="menu-icon">💳</span>
                <span className="menu-text">Phương thức thanh toán</span>
              </button>
              <button
                className="menu-item"
                onClick={() => navigate("/notifications")}
              >
                <span className="menu-icon">🔔</span>
                <span className="menu-text">Thông báo</span>
              </button>
            </nav>
          </aside>

          <main className="profile-main">
            <div className="orders-section">
              <div className="orders-header">
                <h2>Đơn hàng của tôi</h2>
                <div className="order-tabs">
                <button
                  className={`tab-btn ${
                    activeTab === "current" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("current")}
                >
                  Đơn hiện tại ({currentOrders.length})
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  Lịch sử ({historyOrders.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="no-orders">
                <p>Đang tải đơn hàng...</p>
              </div>
            ) : displayOrders.length === 0 ? (
              <div className="no-orders">
                <p>
                  {activeTab === "current"
                    ? "Không có đơn hàng đang xử lý"
                    : "Chưa có lịch sử đơn hàng"}
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {displayOrders.map((order) => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <span className="order-id">
                        #{order.orderNumber || order._id?.slice(-7)}
                      </span>
                      <span className={`order-status ${order.status}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="restaurant-name">
                      {typeof order.restaurant === "object" 
                        ? order.restaurant?.name 
                        : "Nhà hàng"}
                    </div>
                    <div className="order-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="item">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <span>Tổng cộng:</span>
                      <span className="total-price">
                        {(order.total || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </div>
                    <div className="order-actions">
                      {!["delivered", "completed", "cancelled"].includes(order.status) && (
                          <button
                            className="track-order-btn"
                            onClick={() =>
                              navigate(`/order-tracking/${order._id}`)
                            }
                          >
                            Theo dõi đơn hàng
                          </button>
                        )}
                      {(order.status === "completed" || order.status === "delivered") && !order.review && (
                        <button
                          className="review-btn"
                          onClick={() => navigate(`/review/${order._id}`)}
                        >
                          Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
