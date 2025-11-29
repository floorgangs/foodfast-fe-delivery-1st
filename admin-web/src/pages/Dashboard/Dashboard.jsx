import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalStaff: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
        headers,
      });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch recent orders
      const ordersRes = await axios.get(
        `${API_URL}/dashboard/recent-orders?limit=5`,
        { headers }
      );
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }

      // Fetch pending restaurants
      const restaurantsRes = await axios.get(
        `${API_URL}/dashboard/pending-restaurants?limit=5`,
        { headers }
      );
      if (restaurantsRes.data.success) {
        setPendingRestaurants(restaurantsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      delivering: "Đang giao",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p className="welcome-text">Xin chào, quản trị viên 👋</p>
        </div>
        <div className="date-selector">
          <select>
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tháng này</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon material-icons">store</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalRestaurants}</div>
            <h3>Tổng nhà hàng</h3>
            <p className="stat-detail">
              {stats.activeRestaurants} đang hoạt động
            </p>
          </div>
        </div>

        <div className="stat-card today">
          <div className="stat-header">
            <span className="stat-icon material-icons">shopping_cart</span>
            <span className="stat-badge">Hôm nay</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.todayOrders}</div>
            <h3>Đơn hàng hôm nay</h3>
            <p className="stat-detail">Tổng: {stats.totalOrders} đơn</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <span className="stat-icon material-icons">payments</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {(stats.todayRevenue / 1000).toFixed(0)}K
            </div>
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-detail">
              Tổng: {(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon material-icons">badge</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalStaff}</div>
            <h3>Nhân viên</h3>
            <p className="stat-detail">Admin & Nhà hàng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon material-icons">people</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCustomers}</div>
            <h3>Khách hàng</h3>
            <p className="stat-detail">{stats.totalProducts} sản phẩm</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-header">
            <span className="stat-icon material-icons">pending</span>
            <span className="stat-badge">Cần xử lý</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.pendingApprovals}</div>
            <h3>Chờ duyệt</h3>
            <p className="stat-detail">Nhà hàng mới</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <div className="section-header">
            <h2>Đơn hàng gần đây</h2>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Nhà hàng</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order.orderNumber}</strong>
                    </td>
                    <td>{order.restaurant?.name || "N/A"}</td>
                    <td>{order.user?.name || "N/A"}</td>
                    <td>{order.totalAmount.toLocaleString("vi-VN")}đ</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Nhà hàng chờ duyệt</h2>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>
          <div className="pending-list">
            {pendingRestaurants.map((restaurant) => (
              <div key={restaurant._id} className="pending-item">
                <div className="pending-info">
                  <h4>{restaurant.name}</h4>
                  <p>Chủ quán: {restaurant.owner?.name || "N/A"}</p>
                  <span className="time-ago">
                    Gửi {formatTimeAgo(restaurant.createdAt)}
                  </span>
                </div>
                <div className="pending-actions">
                  <button className="approve-btn">✓ Duyệt</button>
                  <button className="reject-btn">✗ Từ chối</button>
                </div>
              </div>
            ))}
            {pendingRestaurants.length === 0 && (
              <p style={{ textAlign: "center", padding: "20px" }}>
                Không có nhà hàng nào chờ duyệt
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
