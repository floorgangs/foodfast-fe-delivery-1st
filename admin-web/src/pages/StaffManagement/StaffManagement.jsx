import { useState, useEffect } from "react";
import axios from "axios";
import "./StaffManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Load staff from Staffs collection
      const staffRes = await axios.get(`${API_URL}/staff/all`, {
        headers,
      });

      if (staffRes.data.success) {
        const staffList = staffRes.data.data || [];

        // Map staff data (already populated with restaurant)
        const mappedStaff = staffList.map((staff) => {
          return {
            ...staff,
            id: staff._id,
            restaurantName: staff.restaurant?.name || "Chưa có nhà hàng",
            restaurantId: staff.restaurant?._id || null,
            // Include user info if account exists
            email: staff.user?.email || staff.email || '',
            userName: staff.user?.name || staff.name,
          };
        });

        setStaff(mappedStaff);

        // Load restaurants for filter dropdown
        const restaurantsRes = await axios.get(`${API_URL}/restaurants`, {
          headers,
        });
        setRestaurants(restaurantsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
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

  let filteredStaff =
    selectedRestaurant === "all"
      ? staff
      : staff.filter((s) => s.restaurantId === selectedRestaurant);

  if (searchTerm) {
    filteredStaff = filteredStaff.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const activeStaff = filteredStaff.filter((s) => s.isActive !== false);

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
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
      <div className="staff-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Nhân viên Nhà hàng</h1>
          <p className="page-description">
            Quản lý nhân viên làm việc tại các nhà hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon material-icons">badge</span>
          <div className="stat-info">
            <div className="stat-number">{staff.length}</div>
            <div className="stat-label">Tổng nhân viên</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">check_circle</span>
          <div className="stat-info">
            <div className="stat-number active">{activeStaff.length}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon material-icons">store</span>
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
            <option value="all">Tất cả ({staff.length})</option>
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
              <th>Chức vị</th>
              <th>Nhà hàng</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member._id}>
                <td>
                  <strong>{member.name}</strong>
                </td>
                <td>{member.email}</td>
                <td>{member.phone || "N/A"}</td>
                <td>
                  {member.position ? (
                    <span className="position-badge">{member.position}</span>
                  ) : (
                    <span style={{color: "#999"}}>Chưa có</span>
                  )}
                </td>
                <td>{member.restaurantName}</td>
                <td>{formatDate(member.createdAt)}</td>
                <td>
                  <span className={getStatusClass(member.isActive)}>
                    {getStatusText(member.isActive)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleView(member)}
                    >
                      Chi tiết
                    </button>
                    {member.isActive !== false ? (
                      <button
                        className="action-btn deactivate"
                        onClick={() =>
                          handleToggleStatus(member._id, member.isActive)
                        }
                      >
                        Tạm khóa
                      </button>
                    ) : (
                      <button
                        className="action-btn activate"
                        onClick={() =>
                          handleToggleStatus(member._id, member.isActive)
                        }
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                  Không có nhân viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem Chi tiết */}
      {showViewModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Nhân viên</h2>
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
                  <span>{selectedStaff.name}</span>
                </div>
                <div className="info-row">
                  <label>Số điện thoại:</label>
                  <span>{selectedStaff.phone || "N/A"}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedStaff.email}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Thông tin công việc</h3>
                <div className="info-row">
                  <label>Nhà hàng:</label>
                  <span>{selectedStaff.restaurantName}</span>
                </div>
                {selectedStaff.position && (
                  <div className="info-row">
                    <label>Chức vị:</label>
                    <span className="position-badge">{selectedStaff.position}</span>
                  </div>
                )}
                <div className="info-row">
                  <label>Vai trò:</label>
                  <span className="position-badge">Nhân viên</span>
                </div>
                <div className="info-row">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(selectedStaff.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={getStatusClass(selectedStaff.isActive)}>
                    {getStatusText(selectedStaff.isActive)}
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

export default StaffManagement;
