import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllOrders,
  subscribeToOrderUpdates,
} from "../../services/orderService";
import "./Profile.css";

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("current"); // current or history

  useEffect(() => {
    loadOrders();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToOrderUpdates(() => {
      loadOrders();
    });

    return unsubscribe;
  }, []);

  const loadOrders = () => {
    const allOrders = getAllOrders();
    // Sort by created date (newest first)
    const sorted = allOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setOrders(sorted);
  };

  const currentOrders = orders.filter(
    (order) => order.status !== "completed" && order.status !== "cancelled"
  );

  const historyOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "cancelled"
  );

  const getStatusText = (status) => {
    const statusMap = {
      pending: "⏳ Chờ xác nhận",
      confirmed: "✅ Đã xác nhận",
      preparing: "👨‍🍳 Đang chuẩn bị",
      ready_for_delivery: "📦 Sẵn sàng giao",
      delivering: "🚁 Đang giao hàng",
      completed: "✔️ Hoàn thành",
      cancelled: "❌ Đã hủy",
    };
    return statusMap[status] || status;
  };

  const displayOrders = activeTab === "current" ? currentOrders : historyOrders;

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Tài khoản của tôi</h1>

        <div className="profile-content">
          <div className="profile-card">
            <div className="avatar">👤</div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>

            <div className="profile-info">
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{user?.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{user?.address}</span>
              </div>
            </div>

            <button
              className="edit-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Chỉnh sửa thông tin
            </button>
          </div>

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

            {displayOrders.length === 0 ? (
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
                  <div key={order.id} className="order-item">
                    <div className="order-header">
                      <span className="order-id">
                        #{order.id.substring(3, 10)}
                      </span>
                      <span className={`order-status ${order.status}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="restaurant-name">
                      {order.restaurantName}
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="item">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>
                            {(item.price * item.quantity).toLocaleString(
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
                        {order.total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </div>
                    <div className="order-actions">
                      {order.status !== "completed" &&
                        order.status !== "cancelled" && (
                          <button
                            className="track-order-btn"
                            onClick={() =>
                              navigate(`/order-tracking/${order.id}`)
                            }
                          >
                            Theo dõi đơn hàng
                          </button>
                        )}
                      {order.status === "completed" && !order.review && (
                        <button
                          className="review-btn"
                          onClick={() => navigate(`/review/${order.id}`)}
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
        </div>
      </div>
    </div>
  );
}

export default Profile;
