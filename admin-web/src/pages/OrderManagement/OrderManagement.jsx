import { useState, useEffect } from "react";
import { orderAPI, restaurantAPI } from "../../services/api";
import "./OrderManagement.css";

function OrderManagement() {
  const [activeTab, setActiveTab] = useState("completed");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load restaurants từ API
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Load orders từ API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAllRestaurants();
      if (response.success && response.data) {
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("=== Loading all orders from API for admin");

      // Admin lấy tất cả orders từ backend
      const response = await orderAPI.getAllOrders();
      console.log("API response:", response);

      if (response.success && response.data) {
        // Transform data sang format của OrderManagement
        const transformedOrders = response.data.map((order) => {
          const restaurantName = order.restaurant?.name || "Nhà hàng không xác định";
          const totalAmount = order.totalAmount || 0;

          return {
            id: order._id,
            restaurantId: order.restaurant?._id || "",
            restaurantName: restaurantName,
            customer: order.customer?.name || order.guestInfo?.name || "Khách vãng lai",
            phone: order.customer?.phone || order.guestInfo?.phone || "",
            address: order.deliveryAddress || "",
            items: order.items?.map((item) => ({
              name: item.product?.name || item.name || "Sản phẩm",
              quantity: item.quantity || 1,
              price: item.price || 0,
            })) || [],
            total: totalAmount,
            discount: order.discount || 0,
            platformFee: Math.round(totalAmount * 0.1), // 10% platform fee
            restaurantReceives: totalAmount - Math.round(totalAmount * 0.1),
            distance: order.distance || 0,
            status: order.status || "pending",
            time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
            note: order.note || "",
            paymentMethod: order.paymentMethod || "PayPal",
            paymentStatus: order.paymentStatus || "pending",
          };
        });

        console.log("Transformed orders:", transformedOrders.length);
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Không thể tải đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    console.log("Updating order status:", id, newStatus);

    try {
      const response = await orderAPI.updateOrderStatus(id, newStatus);

      if (response.success) {
        // Reload orders
        loadOrders();
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter theo nhà hàng
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (order) => order.restaurantId === selectedRestaurant
      );
    }

    // Chỉ hiển thị đơn đã hoàn thành hoặc đã hủy
    filtered = filtered.filter((order) =>
      ["completed", "cancelled"].includes(order.status)
    );

    // Filter theo tab
    switch (activeTab) {
      case "completed":
        return filtered.filter((order) => order.status === "completed");
      case "cancelled":
        return filtered.filter((order) => order.status === "cancelled");
      case "all":
      default:
        return filtered;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Tính toán số lượng cho từng tab (theo nhà hàng được chọn)
  const getTabCounts = () => {
    let filtered = orders;
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (order) => order.restaurantId === selectedRestaurant
      );
    }

    // Chỉ đếm các đơn đã hoàn thành hoặc đã hủy
    const completedAndCancelled = filtered.filter((o) =>
      ["completed", "cancelled"].includes(o.status)
    );

    return {
      all: completedAndCancelled.length,
      completed: completedAndCancelled.filter((o) => o.status === "completed")
        .length,
      cancelled: completedAndCancelled.filter((o) => o.status === "cancelled")
        .length,
    };
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="order-management-page">
        <div className="page-header">
          <h1>Quản lý đơn hàng</h1>
          <p className="subtitle">Đang tải dữ liệu...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management-page">
        <div className="page-header">
          <h1>Quản lý đơn hàng</h1>
        </div>
        <div className="error-state">
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
        <p className="subtitle">Xem lịch sử đơn hàng đã hoàn thành và đã hủy</p>
      </div>

      {/* Restaurant filter */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả nhà hàng</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={loadOrders} className="refresh-btn">
          🔄 Làm mới
        </button>
      </div>

      <div className="order-tabs">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả
          <span className="tab-count">{tabCounts.all}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Hoàn thành
          <span className="tab-count">{tabCounts.completed}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Đã hủy
          <span className="tab-count">{tabCounts.cancelled}</span>
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
                  <span className="restaurant-name">
                    🏪 {order.restaurantName}
                  </span>
                  <span className="customer-name">👤 {order.customer}</span>
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
                <span className="order-date">📅 {order.date}</span>
                <span className="order-total">
                  {order.total.toLocaleString("vi-VN")}đ
                </span>
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
                <h3>Thông tin nhà hàng</h3>
                <div className="info-row">
                  <span className="label">Nhà hàng:</span>
                  <span className="value">{selectedOrder.restaurantName}</span>
                </div>
              </div>

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
                  <span className="value">
                    {selectedOrder.time} - {selectedOrder.date}
                  </span>
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
                    <span className="summary-label">
                      Chiết khấu nền tảng (10%):
                    </span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
