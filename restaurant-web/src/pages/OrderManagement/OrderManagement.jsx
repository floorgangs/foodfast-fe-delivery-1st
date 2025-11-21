import { useState, useEffect } from "react";
import {
  getAllOrders,
  getOrdersByRestaurant,
  updateOrderStatus,
  subscribeToOrderUpdates,
} from "../../services/orderService";
import "./OrderManagement.css";

function OrderManagement() {
  const [activeTab, setActiveTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const restaurantId = "2"; // ID của nhà hàng hiện tại

  // Load orders từ localStorage
  useEffect(() => {
    loadOrders();
  }, []);

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsubscribe = subscribeToOrderUpdates(() => {
      console.log("Order update received in restaurant-web");
      loadOrders();
    });

    return unsubscribe;
  }, []);

  const loadOrders = () => {
    try {
      console.log("=== Loading orders for restaurant:", restaurantId);

      // Lấy orders từ shared localStorage (chỉ orders của nhà hàng này)
      const allOrders = getOrdersByRestaurant(restaurantId);
      console.log("Restaurant orders loaded:", allOrders);
      console.log("Total orders found:", allOrders.length);

      // Transform data sang format của OrderManagement
      const transformedOrders = allOrders.map((order) => {
        console.log("Transforming order:", order.id, order.status);
        return {
          id: order.id,
          customer: order.customerName,
          phone: order.customerPhone,
          address: order.deliveryAddress,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total,
          discount: order.discount || 0,
          platformFee: Math.round(order.total * 0.1), // 10% platform fee
          restaurantReceives: order.total - Math.round(order.total * 0.1),
          distance: 2.5, // Mock distance
          status: mapStatus(order.status),
          time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          note: order.note || "",
          paymentMethod: order.paymentMethod || "Tiền mặt",
        };
      });

      console.log("Transformed orders:", transformedOrders.length);
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
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

  const updateStatus = (id, newStatus) => {
    console.log("Updating order status:", id, newStatus);

    // Update in shared localStorage via orderService
    const updatedOrder = updateOrderStatus(id, newStatus);

    if (updatedOrder) {
      // Update local state
      loadOrders();
    } else {
      console.error("Failed to update order status");
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

  return (
    <div className="order-management-page">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <p className="subtitle">Danh sách đơn hàng chờ xử lý</p>
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
                  {order.total.toLocaleString("vi-VN")}đ
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
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
                <div className="financial-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tổng tiền:</span>
                    <span className="summary-value">
                      {selectedOrder.total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value discount">
                      -{selectedOrder.discount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Chiết khấu nền tảng:</span>
                    <span className="summary-value fee">
                      -{selectedOrder.platformFee.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Quán phải thu:</span>
                    <span className="total-value">
                      {selectedOrder.restaurantReceives.toLocaleString("vi-VN")}
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
