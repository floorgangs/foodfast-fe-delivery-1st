import { useState, useEffect } from "react";
import axios from "axios";
import "./RestaurantOwners.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function RestaurantOwners() {
  const [owners, setOwners] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Load users with role restaurant
      const usersRes = await axios.get(`${API_URL}/auth/users?role=restaurant`, {
        headers,
      });

      // Load restaurants to match with owners
      const restaurantsRes = await axios.get(`${API_URL}/restaurants`, {
        headers,
      });

      if (usersRes.data.success) {
        const restaurantUsers = usersRes.data.data || [];
        const restaurantsList = restaurantsRes.data.data || [];

        // Map users to their restaurants
        const mappedOwners = restaurantUsers.map((user) => {
          const restaurant = restaurantsList.find(
            (r) => r.owner === user._id || r.owner?._id === user._id
          );
          return {
            ...user,
            id: user._id,
            restaurantName: restaurant?.name || "Chưa có nhà hàng",
            restaurantId: restaurant?._id || null,
          };
        });

        setOwners(mappedOwners);
        setRestaurants(restaurantsList);
      }
    } catch (error) {
      console.error("Error loading restaurant owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (isActive) => {
    return isActive !== false ? "Hoạt động" : "Đã khóa";
  };

  const getStatusClass = (isActive) => {
    return `status-badge ${isActive !== false ? "active" : "inactive"}`;
  };

  let filteredOwners =
    selectedRestaurant === "all"
      ? owners
      : owners.filter((o) => o.restaurantId === selectedRestaurant);

  if (searchTerm) {
    filteredOwners = filteredOwners.filter(
      (o) =>
        o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.phone?.includes(searchTerm) ||
        o.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const activeOwners = filteredOwners.filter((o) => o.isActive !== false);

  const handleView = (owner) => {
    setSelectedOwner(owner);
    setShowViewModal(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm(`Bạn có chắc muốn ${currentStatus !== false ? "khóa" : "mở khóa"} tài khoản này?`)) {
      return;
    }

    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      await axios.put(
        `${API_URL}/auth/users/${userId}/status`,
        { isActive: currentStatus === false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadData();
      alert("Đã cập nhật trạng thái!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Không thể cập nhật trạng thái");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="restaurant-owners-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-owners-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Chủ Nhà hàng</h1>
          <p className="page-description">
            Quản lý tài khoản chủ nhà hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon material-icons">store</span>
          <div className="stat-info">
            <div className="stat-number">{owners.length}</div>
            <div className="stat-label">Tổng chủ nhà hàng</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">check_circle</span>
          <div className="stat-info">
            <div className="stat-number active">{activeOwners.length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">restaurant</span>
          <div className="stat-info">
            <div className="stat-number">{restaurants.length}</div>
            <div className="stat-label">Nhà hàng</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-section">
          <label>Lọc theo nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="restaurant-select"
          >
            <option value="all">Tất cả ({owners.length})</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="staff-table">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Nhà hàng</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.map((owner) => (
              <tr key={owner._id}>
                <td>
                  <strong>{owner.name}</strong>
                </td>
                <td>{owner.email}</td>
                <td>{owner.phone || "N/A"}</td>
                <td>{owner.restaurantName}</td>
                <td>{formatDate(owner.createdAt)}</td>
                <td>
                  <span className={getStatusClass(owner.isActive)}>
                    {getStatusText(owner.isActive)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleView(owner)}
                    >
                      Chi tiết
                    </button>
                    {owner.isActive !== false ? (
                      <button
                        className="action-btn deactivate"
                        onClick={() =>
                          handleToggleStatus(owner._id, owner.isActive)
                        }
                      >
                        Tạm khóa
                      </button>
                    ) : (
                      <button
                        className="action-btn activate"
                        onClick={() =>
                          handleToggleStatus(owner._id, owner.isActive)
                        }
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOwners.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  Không có chủ nhà hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem Chi tiết */}
      {showViewModal && selectedOwner && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Chủ Nhà hàng</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h3>Thông tin cá nhân</h3>
                <div className="info-row">
                  <label>Họ và tên:</label>
                  <span>{selectedOwner.name}</span>
                </div>
                <div className="info-row">
                  <label>Số điện thoại:</label>
                  <span>{selectedOwner.phone || "N/A"}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedOwner.email}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Thông tin công việc</h3>
                <div className="info-row">
                  <label>Nhà hàng:</label>
                  <span>{selectedOwner.restaurantName}</span>
                </div>
                <div className="info-row">
                  <label>Vai trò:</label>
                  <span className="position-badge">Chủ nhà hàng</span>
                </div>
                <div className="info-row">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(selectedOwner.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={getStatusClass(selectedOwner.isActive)}>
                    {getStatusText(selectedOwner.isActive)}
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

export default RestaurantOwners;
