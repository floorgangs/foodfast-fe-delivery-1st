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
    const restaurantId = restaurant?._id || restaurant?.id;

    if (restaurantId) {
      console.log("🏪 Restaurant found, loading orders:", restaurantId);
      loadOrders();
      // Poll mỗi 30 giây để cập nhật đơn hàng mới
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    } else {
      console.log("⚠️ No restaurant ID found, stopping loading");
      setLoading(false);
      setError("Không tìm thấy thông tin nhà hàng");
    }
  }, [restaurant]);

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
          total: order.totalAmount,
          discount: order.discount || 0,
          platformFee: Math.round(order.totalAmount * 0.1), // 10% platform fee
          restaurantReceives:
            order.totalAmount - Math.round(order.totalAmount * 0.1),
          distance: order.distance || 2.5,
          status: mapStatus(order.status),
          time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          note: order.note || "",
          paymentMethod: order.paymentMethod || "Tiền mặt",
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

  // Helper function để map status
  const mapStatus = (status) => {
    const statusMap = {
      pending: "pending",
      confirmed: "confirmed",
      preparing: "preparing",
      delivering: "delivering",
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
          ["confirmed", "preparing", "delivering"].includes(order.status)
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
          Đã xác nhận
          <span className="tab-count">
            {
              orders.filter((o) =>
                ["confirmed", "preparing", "delivering"].includes(o.status)
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
                  {order.status === "preparing" && "Đang chuẩn bị"}
                  {order.status === "delivering" && "Đang giao"}
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
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="prepare-btn btn-small"
                  >
                    Sẵn sàng giao
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "delivering")}
                    className="ready-btn btn-small"
                  >
                    Đang giao
                  </button>
                )}
                {order.status === "delivering" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
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
                    {selectedOrder.status === "delivering" && "Đang giao"}
                    {selectedOrder.status === "completed" && "Hoàn thành"}
                    {selectedOrder.status === "cancelled" && "Đã hủy"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.note && (
                  <div className="info-row">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedOrder.note}</span>
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
                    <span className="summary-label">Tổng tiền:</span>
                    <span className="summary-value">
                      {(selectedOrder.total || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value discount">
                      -{(selectedOrder.discount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Chiết khấu nền tảng:</span>
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
                    Sẵn sàng giao hàng
                  </button>
                )}
                {selectedOrder.status === "preparing" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "delivering");
                      setShowDetailModal(false);
                    }}
                    className="ready-btn"
                  >
                    Đang giao hàng
                  </button>
                )}
                {selectedOrder.status === "delivering" && (
                  <button
                    onClick={() => {
                      updateStatus(selectedOrder.id, "completed");
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
