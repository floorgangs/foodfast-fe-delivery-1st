import { useState, useEffect } from "react";
import axios from "axios";
import "./RestaurantManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function RestaurantManagement() {
  const [filter, setFilter] = useState("all"); // all, active, pending, suspended
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    description: "",
    cuisine: [],
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/restaurants`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        const apiRestaurants = response.data.data || [];
        // Transform to match UI format
        const transformed = apiRestaurants.map((r) => ({
          id: r._id,
          name: r.name,
          owner: r.owner?.name || "N/A",
          phone: r.phone || r.owner?.phone || "N/A",
          email: r.email || r.owner?.email || "N/A",
          address:
            typeof r.address === "string"
              ? r.address
              : `${r.address?.street || ""}, ${r.address?.district || ""}, ${
                  r.address?.city || ""
                }`.trim(),
          status: r.isApproved
            ? r.isActive
              ? "active"
              : "suspended"
            : "pending",
          rating: r.rating || 0,
          orders: r.totalOrders || 0,
          revenue: r.totalRevenue || 0,
          joined: r.createdAt,
          description: r.description || "",
          cuisine: r.cuisine || [],
        }));
        setRestaurants(transformed);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      alert("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowViewModal(true);
  };

  const handleApprove = async (id) => {
    if (!confirm("Bạn có chắc muốn duyệt nhà hàng này?")) return;

    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/restaurants/${id}`,
        { isApproved: true, isActive: true },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        await loadRestaurants();
        alert("Đã duyệt nhà hàng!");
      }
    } catch (error) {
      console.error("Error approving restaurant:", error);
      alert(error.response?.data?.message || "Không thể duyệt nhà hàng");
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm("Bạn có chắc muốn khóa nhà hàng này?")) return;

    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/restaurants/${id}`,
        { isActive: false },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        await loadRestaurants();
        alert("Đã khóa nhà hàng!");
      }
    } catch (error) {
      console.error("Error suspending restaurant:", error);
      alert(error.response?.data?.message || "Không thể khóa nhà hàng");
    }
  };

  const handleActivate = async (id) => {
    if (!confirm("Bạn có chắc muốn kích hoạt lại nhà hàng này?")) return;

    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/restaurants/${id}`,
        { isActive: true },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        await loadRestaurants();
        alert("Đã kích hoạt lại nhà hàng!");
      }
    } catch (error) {
      console.error("Error activating restaurant:", error);
      alert(error.response?.data?.message || "Không thể kích hoạt nhà hàng");
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");

      // First, create user account for restaurant owner
      const userResponse = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: "restaurant",
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (userResponse.data.success) {
        const userId = userResponse.data.data._id;

        // Then create restaurant with the user as owner
        const restaurantResponse = await axios.post(
          `${API_URL}/restaurants`,
          {
            owner: userId,
            name: formData.name,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            isApproved: true, // Admin-created restaurants are auto-approved
            isActive: true,
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (restaurantResponse.data.success) {
          await loadRestaurants();
          setShowCreateModal(false);
          resetForm();
          alert("Tạo nhà hàng thành công!");
        }
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert(error.response?.data?.message || "Không thể tạo nhà hàng");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      description: "",
      cuisine: [],
    });
  };

  if (loading) {
    return (
      <div className="restaurant-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhà hàng</h1>
          <p className="page-description">
            Quản lý tất cả nhà hàng trong hệ thống
          </p>
        </div>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          + Thêm nhà hàng
        </button>
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
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-content create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Thêm nhà hàng mới</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRestaurant}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Tên nhà hàng *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên nhà hàng"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mật khẩu *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả về nhà hàng"
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-create">
                    Tạo nhà hàng
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantManagement;
