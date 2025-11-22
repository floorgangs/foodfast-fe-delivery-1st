import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { orderAPI } from "../../services/api";
import "./OrderManagement.css";

function OrderManagement() {
  const [activeTab, setActiveTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const restaurant = useSelector((state) => state.auth.restaurant);

  // Load orders từ API
  useEffect(() => {
    if (restaurant?._id) {
      loadOrders();
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
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

      const response = await orderAPI.getMyOrders();

      if (response?.success) {
        const apiOrders = response.data || [];

        const transformedOrders = apiOrders.map((order) => ({
          id: order._id,
          customer:
            order.customer?.name || order.guestCustomer?.name || "Khách hàng",
          phone: order.customer?.phone || order.guestCustomer?.phone || "",
          address: formatDeliveryAddress(order.deliveryAddress),
          items: order.items.map((item) => ({
            name: item.product?.name || item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || 0,
          discount: order.discount || 0,
          total: order.total || 0,
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
      preparing: "preparing",
      ready: "ready",
      delivering: "delivering",
      delivered: "delivered",
      completed: "delivered",
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
          ["confirmed", "preparing", "ready", "delivering"].includes(order.status)
        );
      case "history":
        return orders.filter((order) =>
          ["delivered", "cancelled"].includes(order.status)
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
          Đã xác nhận
          <span className="tab-count">
            {
              orders.filter((o) =>
                ["confirmed", "preparing", "ready", "delivering"].includes(o.status)
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
                ["delivered", "cancelled"].includes(o.status)
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
                  {order.status === "preparing" && "Đang chuẩn bị"}
                  {order.status === "ready" && "Sẵn sàng giao"}
                  {order.status === "delivering" && "Đang giao"}
                  {order.status === "delivered" && "Hoàn thành"}
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
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="prepare-btn btn-small"
                  >
                    Bắt đầu chuẩn bị
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="ready-btn btn-small"
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
                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className="complete-btn btn-small"
                  >
                    Hoàn thành
                  </button>
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
                    {selectedOrder.status === "delivered" && "Hoàn thành"}
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
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}đ
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
                      -{((selectedOrder.total || 0) * 0.05).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="total-row" style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                    <span className="total-label" style={{ fontWeight: 'bold', color: '#0066cc' }}>Quán nhận được:</span>
                    <span className="total-value" style={{ fontSize: '24px', color: '#0066cc' }}>
                      {((selectedOrder.total || 0) * 0.95).toLocaleString("vi-VN")}đ
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
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "delivered");
                      setShowDetailModal(false);
                    }}
                    className="complete-btn"
                  >
                    Hoàn thành giao hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
