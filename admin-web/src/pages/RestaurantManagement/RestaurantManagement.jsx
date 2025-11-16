import { useState } from "react";
import "./RestaurantManagement.css";

function RestaurantManagement() {
  const [filter, setFilter] = useState("all"); // all, active, pending, suspended
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: "Cơm Tấm Sài Gòn",
      owner: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Nguyễn Huệ, Q.1, TP.HCM",
      status: "active",
      rating: 4.8,
      orders: 1245,
      revenue: 125000000,
      joined: "2024-01-15",
    },
    {
      id: 2,
      name: "Bún Bò Huế 24H",
      owner: "Trần Thị B",
      phone: "0912345678",
      address: "456 Lê Lợi, Q.1, TP.HCM",
      status: "active",
      rating: 4.9,
      orders: 2130,
      revenue: 215000000,
      joined: "2023-11-20",
    },
    {
      id: 3,
      name: "KFC Hồ Chí Minh",
      owner: "Lê Văn C",
      phone: "0923456789",
      address: "789 Trần Hưng Đạo, Q.5, TP.HCM",
      status: "active",
      rating: 4.7,
      orders: 5420,
      revenue: 820000000,
      joined: "2023-09-10",
    },
    {
      id: 4,
      name: "Quán Ăn Ngon 123",
      owner: "Phạm Thị D",
      phone: "0934567890",
      address: "321 Võ Văn Tần, Q.3, TP.HCM",
      status: "pending",
      rating: 0,
      orders: 0,
      revenue: 0,
      joined: "2024-11-15",
    },
    {
      id: 5,
      name: "Bánh Mì Huỳnh Hoa",
      owner: "Hoàng Văn E",
      phone: "0945678901",
      address: "654 Hai Bà Trưng, Q.1, TP.HCM",
      status: "pending",
      rating: 0,
      orders: 0,
      revenue: 0,
      joined: "2024-11-16",
    },
    {
      id: 6,
      name: "Lẩu Thái Tom Yum",
      owner: "Võ Thị F",
      phone: "0956789012",
      address: "987 Cách Mạng Tháng 8, Q.10, TP.HCM",
      status: "suspended",
      rating: 3.2,
      orders: 450,
      revenue: 45000000,
      joined: "2024-05-20",
    },
  ]);

  const getStatusText = (status) => {
    const statusMap = {
      active: "✅ Đang hoạt động",
      pending: "⏳ Chờ duyệt",
      suspended: "❌ Đã khóa",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const filteredRestaurants =
    filter === "all"
      ? restaurants
      : restaurants.filter((r) => r.status === filter);

  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowViewModal(true);
  };

  const handleApprove = (id) => {
    setRestaurants(
      restaurants.map((r) => (r.id === id ? { ...r, status: "active" } : r))
    );
    alert("Đã duyệt nhà hàng!");
  };

  const handleSuspend = (id) => {
    setRestaurants(
      restaurants.map((r) => (r.id === id ? { ...r, status: "suspended" } : r))
    );
    alert("Đã khóa nhà hàng!");
  };

  const handleActivate = (id) => {
    setRestaurants(
      restaurants.map((r) => (r.id === id ? { ...r, status: "active" } : r))
    );
    alert("Đã kích hoạt lại nhà hàng!");
  };

  return (
    <div className="restaurant-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhà hàng</h1>
          <p className="page-description">
            Quản lý tất cả nhà hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({restaurants.length})
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Đang hoạt động (
            {restaurants.filter((r) => r.status === "active").length})
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Chờ duyệt (
            {restaurants.filter((r) => r.status === "pending").length})
          </button>
          <button
            className={`filter-btn ${filter === "suspended" ? "active" : ""}`}
            onClick={() => setFilter("suspended")}
          >
            Đã khóa (
            {restaurants.filter((r) => r.status === "suspended").length})
          </button>
        </div>
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm nhà hàng..." />
        </div>
      </div>

      <div className="restaurants-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà hàng</th>
              <th>Chủ quán</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th>Đơn hàng</th>
              <th>Doanh thu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>
                  <strong>#{restaurant.id}</strong>
                </td>
                <td>
                  <strong>{restaurant.name}</strong>
                </td>
                <td>{restaurant.owner}</td>
                <td>{restaurant.phone}</td>
                <td className="address-cell">{restaurant.address}</td>
                <td>
                  <span className={getStatusClass(restaurant.status)}>
                    {getStatusText(restaurant.status)}
                  </span>
                </td>
                <td>
                  {restaurant.rating > 0 ? (
                    <span className="rating">⭐ {restaurant.rating}</span>
                  ) : (
                    <span className="no-rating">Chưa có</span>
                  )}
                </td>
                <td>{restaurant.orders}</td>
                <td>{(restaurant.revenue / 1000000).toFixed(1)}M</td>
                <td>
                  <div className="action-buttons">
                    {restaurant.status === "pending" && (
                      <>
                        <button
                          className="action-btn approve"
                          onClick={() => handleApprove(restaurant.id)}
                        >
                          ✓ Duyệt
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleSuspend(restaurant.id)}
                        >
                          ✗ Từ chối
                        </button>
                      </>
                    )}
                    {restaurant.status === "active" && (
                      <>
                        <button
                          className="action-btn view"
                          onClick={() => handleViewRestaurant(restaurant)}
                        >
                          👁 Xem
                        </button>
                        <button
                          className="action-btn suspend"
                          onClick={() => handleSuspend(restaurant.id)}
                        >
                          🔒 Khóa
                        </button>
                      </>
                    )}
                    {restaurant.status === "suspended" && (
                      <button
                        className="action-btn activate"
                        onClick={() => handleActivate(restaurant.id)}
                      >
                        🔓 Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin nhà hàng</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-row">
                  <span className="label">Mã nhà hàng:</span>
                  <span className="value">#{selectedRestaurant.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tên nhà hàng:</span>
                  <span className="value restaurant-name">
                    {selectedRestaurant.name}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Chủ quán:</span>
                  <span className="value">{selectedRestaurant.owner}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedRestaurant.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa chỉ:</span>
                  <span className="value">{selectedRestaurant.address}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày tham gia:</span>
                  <span className="value">
                    {new Date(selectedRestaurant.joined).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              </div>

              <div className="info-section">
                <h3>Thông tin kinh doanh</h3>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${selectedRestaurant.status}`}>
                    {getStatusText(selectedRestaurant.status)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Đánh giá:</span>
                  <span className="value rating-value">
                    {selectedRestaurant.rating > 0
                      ? `⭐ ${selectedRestaurant.rating}`
                      : "Chưa có đánh giá"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Tổng đơn hàng:</span>
                  <span className="value order-count">
                    {selectedRestaurant.orders.toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Doanh thu:</span>
                  <span className="value revenue-value">
                    {selectedRestaurant.revenue.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantManagement;
