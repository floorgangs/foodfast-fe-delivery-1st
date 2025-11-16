import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 156,
    activeRestaurants: 142,
    totalOrders: 2847,
    todayOrders: 318,
    totalRevenue: 1845000000,
    todayRevenue: 42500000,
    totalStaff: 128,
    activeStaff: 115,
    totalCustomers: 15420,
    activeCustomers: 8943,
    pendingApprovals: 12,
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: "FF10234",
      restaurant: "Cơm Tấm Sài Gòn",
      customer: "Nguyễn Văn A",
      total: 125000,
      status: "delivering",
      time: "10:30",
    },
    {
      id: "FF10235",
      restaurant: "Bún Bò Huế 24H",
      customer: "Trần Thị B",
      total: 85000,
      status: "preparing",
      time: "10:25",
    },
    {
      id: "FF10236",
      restaurant: "KFC Hồ Chí Minh",
      customer: "Lê Văn C",
      total: 250000,
      status: "completed",
      time: "10:20",
    },
    {
      id: "FF10237",
      restaurant: "Phở Hà Nội",
      customer: "Phạm Thị D",
      total: 95000,
      status: "pending",
      time: "10:15",
    },
  ]);

  const [pendingRestaurants, setPendingRestaurants] = useState([
    {
      id: "R001",
      name: "Quán Ăn Ngon 123",
      owner: "Nguyễn Minh A",
      submitted: "2 giờ trước",
      status: "pending",
    },
    {
      id: "R002",
      name: "Bánh Mì Huỳnh Hoa",
      owner: "Trần Văn B",
      submitted: "5 giờ trước",
      status: "pending",
    },
    {
      id: "R003",
      name: "Lẩu Thái Tom Yum",
      owner: "Lê Thị C",
      submitted: "1 ngày trước",
      status: "pending",
    },
  ]);

  const getStatusText = (status) => {
    const statusMap = {
      pending: "⏳ Chờ xác nhận",
      preparing: "👨‍🍳 Đang chuẩn bị",
      delivering: "🚁 Đang giao",
      completed: "✅ Hoàn thành",
      cancelled: "❌ Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

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
            <span className="stat-icon">🏪</span>
            <span className="stat-trend up">+12%</span>
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
            <span className="stat-icon">📦</span>
            <span className="stat-badge">Hôm nay</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.todayOrders}</div>
            <h3>Đơn hàng hôm nay</h3>
            <p className="stat-detail">Tổng: {stats.totalOrders} đơn</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-trend up">+8.5%</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {(stats.todayRevenue / 1000000).toFixed(1)}M
            </div>
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-detail">
              Tổng: {(stats.totalRevenue / 1000000).toFixed(0)}M VNĐ
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">👨‍💼</span>
            <span className="stat-trend up">+5.2%</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalStaff}</div>
            <h3>Nhân viên</h3>
            <p className="stat-detail">{stats.activeStaff} đang làm việc</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">👥</span>
            <span className="stat-trend up">+15.3%</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCustomers}</div>
            <h3>Khách hàng</h3>
            <p className="stat-detail">{stats.activeCustomers} hoạt động</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-header">
            <span className="stat-icon">⚠️</span>
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
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{order.restaurant}</td>
                    <td>{order.customer}</td>
                    <td>{order.total.toLocaleString("vi-VN")}đ</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{order.time}</td>
                  </tr>
                ))}
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
              <div key={restaurant.id} className="pending-item">
                <div className="pending-info">
                  <h4>{restaurant.name}</h4>
                  <p>Chủ quán: {restaurant.owner}</p>
                  <span className="time-ago">Gửi {restaurant.submitted}</span>
                </div>
                <div className="pending-actions">
                  <button className="approve-btn">✓ Duyệt</button>
                  <button className="reject-btn">✗ Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
