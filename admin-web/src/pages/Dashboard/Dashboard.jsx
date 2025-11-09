import './Dashboard.css'

function Dashboard() {
  const stats = {
    totalUsers: 15420,
    totalRestaurants: 256,
    totalOrders: 8945,
    activeDrones: 48,
  }

  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      <p className="subtitle">Tổng quan hệ thống FoodFast</p>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Người dùng</h3>
            <p className="stat-number">{stats.totalUsers.toLocaleString('vi-VN')}</p>
            <span className="stat-trend positive">+12% so với tháng trước</span>
          </div>
        </div>

        <div className="stat-card restaurants">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Nhà hàng</h3>
            <p className="stat-number">{stats.totalRestaurants}</p>
            <span className="stat-trend positive">+5 nhà hàng mới</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Đơn hàng hôm nay</h3>
            <p className="stat-number">{stats.totalOrders.toLocaleString('vi-VN')}</p>
            <span className="stat-trend positive">+8% so với hôm qua</span>
          </div>
        </div>

        <div className="stat-card drones">
          <div className="stat-icon">🚁</div>
          <div className="stat-content">
            <h3>Drone hoạt động</h3>
            <p className="stat-number">{stats.activeDrones}/60</p>
            <span className="stat-trend">12 drone đang giao hàng</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Biểu đồ đơn hàng theo giờ</h3>
          <div className="chart-placeholder">
            <p>📊 Chart placeholder - Thống kê đơn hàng theo giờ trong ngày</p>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top nhà hàng</h3>
          <div className="top-list">
            <div className="top-item">
              <span>1. Cơm Tấm Sài Gòn</span>
              <span className="top-value">350 đơn</span>
            </div>
            <div className="top-item">
              <span>2. Bún Bò Huế 24H</span>
              <span className="top-value">298 đơn</span>
            </div>
            <div className="top-item">
              <span>3. Phở Hà Nội</span>
              <span className="top-value">276 đơn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
