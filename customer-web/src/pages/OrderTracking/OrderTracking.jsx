import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import DroneMap from "../../components/DroneMap/DroneMap";
import {
  cancelOrder,
  confirmReceived,
  subscribeToOrderUpdates,
  canCancelOrder,
  getTimeToCancel,
} from "../../services/orderService";
import "./OrderTracking.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();

  const orderId = paramOrderId || location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [droneProgress, setDroneProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Load order data
  useEffect(() => {
    if (!orderId) {
      console.log("No orderId found");
      setLoading(false);
      return;
    }

    console.log("Loading order with ID:", orderId);

    const loadOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        console.log("Order data loaded:", response.data);
        if (response.data.success) {
          setOrder(response.data.data);

          // Load delivery info if order is delivering
          if (["delivering", "picked_up"].includes(response.data.data.status)) {
            loadDeliveryInfo();
          }
        } else {
          console.error("Order not found");
          alert("Không tìm thấy đơn hàng");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        alert("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    const loadDeliveryInfo = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/deliveries/tracking/${orderId}`
        );
        if (response.data.success) {
          setDeliveryInfo(response.data.data);
        }
      } catch (error) {
        // 404 is expected for orders without delivery/drone assignment yet
        if (error.response?.status !== 404) {
          console.error("Error loading delivery info:", error);
        }
      }
    };

    loadOrder();

    // Poll delivery info every 5 seconds when delivering
    const deliveryInterval = setInterval(() => {
      if (order?.status === "delivering" || order?.status === "picked_up") {
        loadDeliveryInfo();
      }
    }, 5000);

    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates((update) => {
      if (update.orderId === orderId) {
        loadOrder();
      }
    });

    return () => {
      unsubscribe();
      clearInterval(deliveryInterval);
    };
  }, [orderId, navigate]);

  // Update cancel timer
  useEffect(() => {
    if (!order || order.status !== "pending") return;

    const interval = setInterval(() => {
      const remaining = getTimeToCancel(order);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Simulate drone movement when delivering
  useEffect(() => {
    if (order?.status === "delivering" && order?.deliveryStartTime) {
      const startTime = order.deliveryStartTime;
      // Calculate duration from estimatedDeliveryTime (e.g., "25-35 phút")
      const estimatedMinutes = 30; // Default 30 minutes
      const duration = estimatedMinutes * 60 * 1000; // Convert to milliseconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - new Date(startTime).getTime();
        const progress = Math.min((elapsed / duration) * 100, 100);
        setDroneProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [order?.status, order?.deliveryStartTime]);

  const handleCancelOrder = () => {
    const result = cancelOrder(orderId, cancelReason);
    if (result.error) {
      alert(result.error);
    } else {
      setShowCancelModal(false);
      setOrder(result);
    }
  };

  const handleConfirmReceived = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/complete`
      );
      if (response.data.success) {
        setOrder(response.data.data);
        // Navigate to review page after 1 second
        setTimeout(() => {
          navigate(`/review/${orderId}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error confirming received:", error);
      alert("Có lỗi xảy ra khi xác nhận đã nhận hàng");
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h2>Đang tải thông tin đơn hàng...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h2>Không tìm thấy đơn hàng</h2>
            <button onClick={() => navigate("/")} className="btn-primary">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusDisplay = () => {
    const statusMap = {
      pending: {
        title: "Chờ xác nhận",
        icon: "⏳",
        desc: "Đơn hàng đang chờ nhà hàng xác nhận",
        color: "#FFA500",
      },
      confirmed: {
        title: "Đã xác nhận",
        icon: "✅",
        desc: "Nhà hàng đã xác nhận đơn hàng",
        color: "#4CAF50",
      },
      preparing: {
        title: "Đang chuẩn bị",
        icon: "👨‍🍳",
        desc: "Nhà hàng đang chuẩn bị món ăn",
        color: "#2196F3",
      },
      ready_for_delivery: {
        title: "Sẵn sàng giao hàng",
        icon: "📦",
        desc: "Món ăn đã sẵn sàng, chờ drone",
        color: "#9C27B0",
      },
      delivering: {
        title: "Đang giao hàng",
        icon: "🚁",
        desc: "Drone đang giao hàng đến bạn",
        color: "#FF5722",
      },
      completed: {
        title: "Đã giao",
        icon: "🎉",
        desc: "Đơn hàng đã được giao thành công",
        color: "#4CAF50",
      },
      cancelled: {
        title: "Đã hủy",
        icon: "❌",
        desc: order.cancelReason || "Đơn hàng đã bị hủy",
        color: "#F44336",
      },
    };

    return statusMap[order.status] || statusMap.pending;
  };

  const status = getStatusDisplay();
  const canCancel = canCancelOrder(order);

  // Calculate progress for timeline
  const statusOrder = [
    "pending",
    "confirmed",
    "preparing",
    "ready_for_delivery",
    "delivering",
    "completed",
  ];
  const currentIndex = statusOrder.indexOf(order.status);
  const progressPercent = (currentIndex / (statusOrder.length - 1)) * 100;

  return (
    <div className="order-tracking-page">
      <div className="container">
        <div className="tracking-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Về trang chủ
          </button>
          <h1>Theo dõi đơn hàng</h1>
          <p className="order-id">Mã đơn: #{order.id}</p>
        </div>

        <div className="tracking-card">
          {/* Status Header */}
          <div className="status-header" style={{ borderColor: status.color }}>
            <div className="status-icon" style={{ background: status.color }}>
              {status.icon}
            </div>
            <div className="status-info">
              <h2>{status.title}</h2>
              <p>{status.desc}</p>
            </div>
          </div>

          {/* Cancel Timer */}
          {order.status === "pending" && canCancel && (
            <div className="cancel-timer">
              <p>
                Bạn có thể hủy đơn trong:{" "}
                <strong>
                  {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </strong>
              </p>
            </div>
          )}

          {/* Progress Timeline */}
          <div
            className="status-timeline"
            style={{
              "--progress-width": `${progressPercent}%`,
              "--progress-color": "#4A90E2",
            }}
          >
            {[
              { key: "pending", label: "Chờ xác nhận", icon: "⏳" },
              { key: "confirmed", label: "Đã xác nhận", icon: "✅" },
              { key: "preparing", label: "Chuẩn bị", icon: "👨‍🍳" },
              { key: "ready_for_delivery", label: "Sẵn sàng", icon: "📦" },
              { key: "delivering", label: "Đang giao", icon: "🚁" },
              { key: "completed", label: "Hoàn thành", icon: "🎉" },
            ].map((step) => {
              const statusOrder = [
                "pending",
                "confirmed",
                "preparing",
                "ready_for_delivery",
                "delivering",
                "completed",
              ];
              const currentIndex = statusOrder.indexOf(order.status);
              const stepIndex = statusOrder.indexOf(step.key);
              const isActive = stepIndex <= currentIndex;

              return (
                <div
                  key={step.key}
                  className={`status-step ${isActive ? "active" : ""}`}
                >
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-label">{step.label}</div>
                </div>
              );
            })}
          </div>

          {/* Real-time Drone Tracking Map */}
          {(order.status === "delivering" || order.status === "picked_up") && (
            <div className="drone-tracking-map">
              <h3>🚁 Theo dõi drone giao hàng</h3>
              <div className="map-container">
                <DroneMap order={order} deliveryInfo={deliveryInfo} />
              </div>
              {deliveryInfo && (
                <div className="delivery-stats">
                  <div className="stat">
                    <span className="stat-label">Drone:</span>
                    <span className="stat-value">
                      {deliveryInfo.drone?.model || "N/A"}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Pin:</span>
                    <span className="stat-value">
                      {deliveryInfo.drone?.batteryLevel || 0}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Trạng thái:</span>
                    <span className="stat-value">
                      {deliveryInfo.status === "picked_up"
                        ? "Đã lấy hàng"
                        : deliveryInfo.status === "assigned"
                        ? "Đã được giao nhiệm vụ"
                        : "Đang giao hàng"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="order-details">
            <h3>Chi tiết đơn hàng</h3>

            <div className="restaurant-info">
              <h4>{order.restaurantName}</h4>
              <p>{order.restaurantAddress}</p>
            </div>

            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="item-price">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{order.subtotal?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí giao hàng:</span>
                <span>{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row discount">
                  <span>Giảm giá:</span>
                  <span>-{order.discount?.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{order.total?.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <div className="delivery-info">
              <div className="info-row">
                <span className="label">📍 Địa chỉ giao:</span>
                <span className="value">
                  {typeof order.deliveryAddress === "string"
                    ? order.deliveryAddress
                    : order.deliveryAddress?.address || "Chưa có địa chỉ"}
                </span>
              </div>
              <div className="info-row">
                <span className="label">📞 Số điện thoại:</span>
                <span className="value">
                  {order.deliveryAddress?.phone || "Chưa có SĐT"}
                </span>
              </div>
              <div className="info-row">
                <span className="label">💳 Thanh toán:</span>
                <span className="value">
                  {order.paymentMethod === "dronepay"
                    ? "Thanh toán online"
                    : order.paymentMethod === "cod"
                    ? "Tiền mặt"
                    : order.paymentMethod}
                </span>
              </div>
              <div className="info-row">
                <span className="label">🕐 Thời gian đặt:</span>
                <span className="value">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {canCancel && order.status === "pending" && (
              <button
                className="btn-cancel"
                onClick={() => setShowCancelModal(true)}
              >
                Hủy đơn hàng
              </button>
            )}

            {(order.status === "delivering" && droneProgress >= 100) ||
            order.status === "delivered" ? (
              <button className="btn-confirm" onClick={handleConfirmReceived}>
                ✓ Đã nhận được đơn hàng
              </button>
            ) : null}

            {order.status === "completed" && !order.review && (
              <button
                className="btn-review"
                onClick={() => navigate(`/review/${orderId}`)}
              >
                ⭐ Đánh giá đơn hàng
              </button>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCancelModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Hủy đơn hàng</h3>
              <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
              <textarea
                placeholder="Lý do hủy (tùy chọn)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
              />
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Đóng
                </button>
                <button className="btn-danger" onClick={handleCancelOrder}>
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
