import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { orderAPI } from "../../services/api";
import "./OrderManagement.css";

function OrderManagement() {
  const [activeTab, setActiveTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [loadingDrones, setLoadingDrones] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const restaurant = useSelector((state) => state.auth.restaurant);

  // Load orders từ API
  useEffect(() => {
    const restaurantId = restaurant?._id || restaurant?.id;

    if (restaurantId) {
      console.log("🏪 Restaurant found, loading orders:", restaurantId);
      loadOrders();
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    } else {
      console.log("⚠️ No restaurant ID found, stopping loading");
      setLoading(false);
      setError("Không tìm thấy thông tin nhà hàng");
    }
  }, [restaurant]);

  const formatDeliveryAddress = (deliveryAddress = {}) => {
    const { address, street, ward, district, city } = deliveryAddress || {};
    return [address, street, ward, district, city].filter(Boolean).join(", ");
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Loading orders for restaurant:", restaurant);

      // Timeout sau 10 giây
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError("Timeout: Không thể kết nối đến server");
      }, 10000);

      // Lấy orders của nhà hàng từ API (backend tự động filter theo user)
      const response = await orderAPI.getMyOrders();

      clearTimeout(timeoutId);
      console.log("📦 Orders response:", response);

      if (response?.success) {
        const apiOrders = response.data || [];

        console.log(`✅ Loaded ${apiOrders.length} orders`);

        // Transform data sang format của OrderManagement
        const transformedOrders = apiOrders.map((order) => ({
          id: order._id,
          customer:
            order.customer?.name || order.deliveryInfo?.name || "Khách hàng",
          phone: order.customer?.phone || order.deliveryInfo?.phone || "",
          address: order.deliveryInfo?.address || "",
          items: order.items.map((item) => ({
            name: item.product?.name || item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || 0,
          discount: order.discount || 0,
          platformFee: Math.round(order.totalAmount * 0.1), // 10% platform fee
          restaurantReceives:
            order.totalAmount - Math.round(order.totalAmount * 0.1),
          distance: order.distance || 2.5,
          status: mapStatus(order.status),
          customerNote: order.customerNote || "",
          paymentMethod: mapPaymentMethod(order.paymentMethod),
          time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          note: order.customerNote || "",
          droneId: order.drone?._id || null,
        }));

        setOrders(transformedOrders);
      } else {
        throw new Error(response?.message || "Không thể tải đơn hàng");
      }
    } catch (err) {
      setError(err?.message || "Đã xảy ra lỗi khi tải đơn hàng");
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status) => {
    const statusMap = {
      pending: "pending",
      confirmed: "confirmed",
      ready: "ready",
      delivering: "delivering",
      delivered: "delivered",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
  };

  // Helper function để map payment method
  const mapPaymentMethod = (method) => {
    const methodMap = {
      cash: "Tiền mặt",
      vnpay: "VNPay",
      momo: "MoMo",
      zalopay: "ZaloPay",
      card: "Thẻ tín dụng",
      banking: "Chuyển khoản",
      dronepay: "DronePay",
    };
    return methodMap[method] || method;
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // Nếu chuyển từ preparing sang delivering, cần chọn drone trước
      if (newStatus === "delivering") {
        const order = orders.find((o) => o.id === id);
        if (order && order.status === "preparing") {
          // Mở modal chọn drone
          await loadAvailableDrones(order);
          setSelectedOrder(order);
          setShowDroneModal(true);
          return; // Dừng lại, đợi user chọn drone
        }
      }

      const response = await orderAPI.updateStatus(id, newStatus);
      if (response?.success) {
        await loadOrders(); // Reload danh sách
      } else {
        alert(response?.message || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      alert(err?.message || "Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const loadAvailableDrones = async (order) => {
    try {
      setLoadingDrones(true);
      const response = await orderAPI.getAvailableDrones({
        restaurantId: restaurant?._id || restaurant?.id,
        distance: order.distance || 5,
        weight: 2, // Default weight
      });

      if (response?.success) {
        setAvailableDrones(response.data || []);
      }
    } catch (err) {
      console.error("Error loading drones:", err);
      alert("Không thể tải danh sách drone");
    } finally {
      setLoadingDrones(false);
    }
  };

  const handleAssignDrone = async () => {
    if (!selectedDrone || !selectedOrder) {
      alert("Vui lòng chọn drone");
      return;
    }

    try {
      const response = await orderAPI.assignDrone({
        orderId: selectedOrder.id,
        droneId: selectedDrone._id,
      });

      if (response?.success) {
        alert("Giao drone thành công!");
        setShowDroneModal(false);
        setShowDetailModal(false);
        await loadOrders();
      } else {
        alert(response?.message || "Không thể giao drone");
      }
    } catch (err) {
      alert(err?.message || "Có lỗi xảy ra khi giao drone");
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "new":
        return orders.filter((order) => order.status === "pending");
      case "confirmed":
        return orders.filter((order) =>
          ["confirmed", "ready", "delivering", "delivered"].includes(order.status)
        );
      case "history":
        return orders.filter((order) =>
          ["completed", "cancelled"].includes(order.status)
        );
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="order-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management-page">
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={loadOrders} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management-page">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <p className="subtitle">Danh sách đơn hàng của {restaurant?.name}</p>
      </div>

      <div className="order-tabs">
        <button
          className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          Đơn mới
          <span className="tab-count">
            {orders.filter((o) => o.status === "pending").length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "confirmed" ? "active" : ""}`}
          onClick={() => setActiveTab("confirmed")}
        >
          Đang xử lý
          <span className="tab-count">
            {
              orders.filter((o) =>
                ["confirmed", "ready", "delivering", "delivered"].includes(o.status)
              ).length
            }
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Lịch sử
          <span className="tab-count">
            {
              orders.filter((o) =>
                ["completed", "cancelled"].includes(o.status)
              ).length
            }
          </span>
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Đơn #{order.id}</span>
                  <span className="customer-name">{order.customer}</span>
                </div>
                <span className={`status-badge ${order.status}`}>
                  {order.status === "pending" && "Chờ xác nhận"}
                  {order.status === "confirmed" && "Đã xác nhận"}
                  {order.status === "ready" && "Sẵn sàng giao"}
                  {order.status === "delivering" && "Đang giao"}
                  {order.status === "delivered" && "Chờ giao hàng"}
                  {order.status === "completed" && "Hoàn thành"}
                  {order.status === "cancelled" && "Đã hủy"}
                </span>
              </div>

              <div className="order-details">
                <p className="order-items">
                  {order.items
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ")}
                </p>
              </div>

              <div className="order-footer">
                <span className="order-time">🕐 {order.time}</span>
                <span className="order-total">
                  {(order.total || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div
                className="order-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, "confirmed")}
                      className="accept-btn btn-small"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      className="reject-btn btn-small"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="prepare-btn btn-small"
                  >
                    Sẵn sàng giao
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    onClick={() => updateStatus(order.id, "delivering")}
                    className="ready-btn btn-small"
                  >
                    Bắt đầu giao
                  </button>
                )}
                {order.status === "delivering" && (
                  <span className="delivering-status">
                    🚁 Drone đang giao...
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-row">
                  <span className="label">Tên khách hàng:</span>
                  <span className="value">{selectedOrder.customer}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedOrder.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa chỉ giao hàng:</span>
                  <span className="value">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="info-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">#{selectedOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian đặt:</span>
                  <span className="value">{selectedOrder.time}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khoảng cách:</span>
                  <span className="value">{selectedOrder.distance} km</span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${selectedOrder.status}`}>
                    {selectedOrder.status === "pending" && "Chờ xác nhận"}
                    {selectedOrder.status === "confirmed" && "Đã xác nhận"}
                    {selectedOrder.status === "preparing" && "Đang chuẩn bị"}
                    {selectedOrder.status === "ready" && "Sẵn sàng giao"}
                    {selectedOrder.status === "delivering" && "Đang giao"}
                    {selectedOrder.status === "delivered" && "Chờ giao hàng"}
                    {selectedOrder.status === "completed" && "Hoàn thành"}
                    {selectedOrder.status === "cancelled" && "Đã hủy"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.customerNote && (
                  <div className="info-row">
                    <span className="label">🗒️ Ghi chú khách hàng:</span>
                    <span className="value" style={{ fontStyle: 'italic', color: '#666' }}>
                      {selectedOrder.customerNote}
                    </span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Chi tiết món ăn</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        {(
                          (item.price || 0) * (item.quantity || 0)
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  ))}
                </div>
                <div className="financial-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tạm tính:</span>
                    <span className="summary-value">
                      {(selectedOrder.subtotal || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Phí giao hàng:</span>
                    <span className="summary-value">
                      {(selectedOrder.deliveryFee || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Giảm giá:</span>
                      <span className="summary-value discount">
                        -{(selectedOrder.discount || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="total-row">
                    <span className="total-label">Tổng cộng:</span>
                    <span className="total-value">
                      {(selectedOrder.total || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ddd' }}>
                    <span className="summary-label">Chiết khấu nền tảng (5%):</span>
                    <span className="summary-value fee">
                      -
                      {(selectedOrder.platformFee || 0).toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Quán phải thu:</span>
                    <span className="total-value">
                      {(selectedOrder.restaurantReceives || 0).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedOrder.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(selectedOrder.id, "confirmed");
                        setShowDetailModal(false);
                      }}
                      className="accept-btn"
                    >
                      Xác nhận đơn hàng
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedOrder.id, "cancelled");
                        setShowDetailModal(false);
                      }}
                      className="reject-btn"
                    >
                      Từ chối đơn hàng
                    </button>
                  </>
                )}
                {selectedOrder.status === "confirmed" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "preparing");
                      setShowDetailModal(false);
                    }}
                    className="prepare-btn"
                  >
                    Bắt đầu chuẩn bị
                  </button>
                )}
                {selectedOrder.status === "preparing" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "ready");
                      setShowDetailModal(false);
                    }}
                    className="ready-btn"
                  >
                    Sẵn sàng giao hàng
                  </button>
                )}
                {selectedOrder.status === "ready" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "delivering");
                      setShowDetailModal(false);
                    }}
                    className="ready-btn"
                  >
                    Bắt đầu giao hàng
                  </button>
                )}
                {selectedOrder.status === "delivering" && (
                  <div className="delivering-info">
                    <p className="info-text">🚁 Drone đang giao hàng...</p>
                    <p className="hint-text">Trạng thái sẽ tự động cập nhật khi drone giao hàng thành công</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drone Selection Modal */}
      {showDroneModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDroneModal(false)}>
          <div className="drone-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chọn Drone Giao Hàng</h2>
              <button
                className="close-btn"
                onClick={() => setShowDroneModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary">
                <p>
                  <strong>Đơn hàng:</strong> #{selectedOrder.id}
                </p>
                <p>
                  <strong>Khoảng cách:</strong> {selectedOrder.distance} km
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {selectedOrder.address}
                </p>
              </div>

              {loadingDrones ? (
                <div className="loading-drones">
                  <div className="spinner"></div>
                  <p>Đang tải danh sách drone...</p>
                </div>
              ) : availableDrones.length === 0 ? (
                <div className="no-drones">
                  <p>Không có drone khả dụng</p>
                  <p className="hint">
                    Vui lòng kiểm tra lại pin và trạng thái drone
                  </p>
                </div>
              ) : (
                <div className="drones-list">
                  {availableDrones.map((drone) => (
                    <div
                      key={drone._id}
                      className={`drone-card ${
                        selectedDrone?._id === drone._id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedDrone(drone)}
                    >
                      <div className="drone-info">
                        <h4>{drone.model}</h4>
                        <p className="drone-serial">{drone.serialNumber}</p>
                      </div>
                      <div className="drone-stats">
                        <div className="stat">
                          <span className="stat-label">Pin:</span>
                          <span
                            className={`stat-value ${
                              drone.batteryLevel > 70
                                ? "good"
                                : drone.batteryLevel > 30
                                ? "warning"
                                : "low"
                            }`}
                          >
                            {drone.batteryLevel}%
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Phạm vi:</span>
                          <span className="stat-value">
                            {drone.maxRange} km
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Tải trọng:</span>
                          <span className="stat-value">
                            {drone.maxWeight} kg
                          </span>
                        </div>
                      </div>
                      {drone.batteryLevel < 30 && (
                        <p className="warning-text">
                          ⚠️ Pin thấp, không đủ cho chuyến bay
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowDroneModal(false)}
              >
                Hủy
              </button>
              <button
                className="assign-btn"
                onClick={handleAssignDrone}
                disabled={!selectedDrone || loadingDrones}
              >
                Giao hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
