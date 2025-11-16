import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  getOrderById,
  cancelOrder,
  confirmReceived,
  subscribeToOrderUpdates,
  canCancelOrder,
  getTimeToCancel,
} from "../../services/orderService";
import "./OrderTracking.css";

function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();

  const orderId = paramOrderId || location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [droneProgress, setDroneProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Load order data
  useEffect(() => {
    if (!orderId) {
      console.log("No orderId found, redirecting to home");
      navigate("/");
      return;
    }

    console.log("Loading order with ID:", orderId);

    const loadOrder = () => {
      const orderData = getOrderById(orderId);
      console.log("Order data loaded:", orderData);
      if (orderData) {
        setOrder(orderData);
      } else {
        console.error("Order not found with ID:", orderId);
      }
    };

    loadOrder();

    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates((update) => {
      if (update.orderId === orderId) {
        loadOrder();
      }
    });

    return () => unsubscribe();
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
    if (order?.status === "delivering") {
      const startTime = order.deliveryStartTime || Date.now();
      const duration = 15000; // 15 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
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

  const handleConfirmReceived = () => {
    const updatedOrder = confirmReceived(orderId);
    setOrder(updatedOrder);

    // Navigate to review page after 1 second
    setTimeout(() => {
      navigate(`/review/${orderId}`);
    }, 1000);
  };

  if (!order) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <p>Đang tải thông tin đơn hàng...</p>
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

          {/* Drone Tracking Animation */}
          {order.status === "delivering" && (
            <div className="drone-tracking">
              <h3>🚁 Drone đang giao hàng</h3>
              <div className="drone-animation">
                <div className="route">
                  <div className="location start">
                    <span className="icon">🏪</span>
                    <span className="label">Nhà hàng</span>
                  </div>
                  <div className="drone-path">
                    <div
                      className="drone"
                      style={{ left: `${droneProgress}%` }}
                    >
                      <span className="drone-icon">🚁</span>
                      <span className="drone-shadow"></span>
                    </div>
                    <div className="path-line">
                      <div
                        className="path-progress"
                        style={{ width: `${droneProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="location end">
                    <span className="icon">🏠</span>
                    <span className="label">Bạn</span>
                  </div>
                </div>
                <div className="delivery-eta">
                  <p>
                    Thời gian còn lại:{" "}
                    <strong>
                      {Math.max(0, Math.ceil(15 - (droneProgress / 100) * 15))}s
                    </strong>
                  </p>
                </div>
              </div>
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
                <span className="value">{order.deliveryAddress}</span>
              </div>
              <div className="info-row">
                <span className="label">💳 Thanh toán:</span>
                <span className="value">{order.paymentMethod}</span>
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

            {order.status === "delivering" && droneProgress >= 100 && (
              <button className="btn-confirm" onClick={handleConfirmReceived}>
                ✓ Đã nhận được đơn hàng
              </button>
            )}

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
