import { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/auth/users?role=customer`, {
        headers,
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (isActive) => {
    return isActive !== false ? "✓ Hoạt động" : "✗ Đã khóa";
  };

  const getStatusClass = (isActive) => {
    return `status-badge ${isActive !== false ? "active" : "inactive"}`;
  };

  let filteredUsers = users;

  if (filter === "active") {
    filteredUsers = filteredUsers.filter((u) => u.isActive !== false);
  } else if (filter === "inactive") {
    filteredUsers = filteredUsers.filter((u) => u.isActive === false);
  }

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const activeUsers = users.filter((u) => u.isActive !== false);

  const handleView = (user) => {
    setSelectedUser(user);
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
      await loadUsers();
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

  const getAddressCount = (user) => {
    return user.addresses?.length || 0;
  };

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Khách hàng</h1>
          <p className="page-description">
            Quản lý tài khoản khách hàng sử dụng ứng dụng
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon material-icons">people</span>
          <div className="stat-info">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Tổng khách hàng</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">check_circle</span>
          <div className="stat-info">
            <div className="stat-number active">{activeUsers.length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">block</span>
          <div className="stat-info">
            <div className="stat-number inactive">
              {users.length - activeUsers.length}
            </div>
            <div className="stat-label">Đã khóa</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({users.length})
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Hoạt động ({activeUsers.length})
          </button>
          <button
            className={`filter-btn ${filter === "inactive" ? "active" : ""}`}
            onClick={() => setFilter("inactive")}
          >
            Đã khóa ({users.length - activeUsers.length})
          </button>
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

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Tên khách hàng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <strong>{user.name}</strong>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{getAddressCount(user)} địa chỉ</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <span className={getStatusClass(user.isActive)}>
                    {getStatusText(user.isActive)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleView(user)}
                    >
                      Chi tiết
                    </button>
                    {user.isActive !== false ? (
                      <button
                        className="action-btn deactivate"
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        Tạm khóa
                      </button>
                    ) : (
                      <button
                        className="action-btn activate"
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  Không có khách hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem Chi tiết */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Khách hàng</h2>
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
                  <span>{selectedUser.name}</span>
                </div>
                <div className="info-row">
                  <label>Số điện thoại:</label>
                  <span>{selectedUser.phone || "N/A"}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="info-row">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={getStatusClass(selectedUser.isActive)}>
                    {getStatusText(selectedUser.isActive)}
                  </span>
                </div>
              </div>

              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className="info-section">
                  <h3>Địa chỉ ({selectedUser.addresses.length})</h3>
                  {selectedUser.addresses.map((addr, idx) => (
                    <div key={idx} className="address-item">
                      <strong>{addr.label || `Địa chỉ ${idx + 1}`}</strong>
                      {addr.isDefault && <span className="default-badge">Mặc định</span>}
                      <p>{addr.address}, {addr.ward}, {addr.district}, {addr.city}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
