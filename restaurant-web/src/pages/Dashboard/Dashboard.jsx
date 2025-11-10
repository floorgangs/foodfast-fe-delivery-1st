import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import './Dashboard.css'

function Dashboard() {
  const { restaurant } = useSelector(state => state.auth)
  const [stats, setStats] = useState({
    todayOrders: 45,
    pendingOrders: 8,
    completedOrders: 37,
    todayRevenue: 12500000,
  })

  const [recentOrders, setRecentOrders] = useState([
    { id: '1001', customer: 'Nguyễn Văn A', total: 125000, status: 'pending', time: '10:30' },
    { id: '1002', customer: 'Trần Thị B', total: 85000, status: 'preparing', time: '10:25' },
    { id: '1003', customer: 'Lê Văn C', total: 150000, status: 'delivering', time: '10:20' },
    { id: '1004', customer: 'Phạm Thị D', total: 95000, status: 'completed', time: '10:15' },
  ])

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p className="welcome-text">Chào mừng đến với {restaurant?.name}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Đơn hôm nay</h3>
            <p className="stat-number">{stats.todayOrders}</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Đang chờ</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Hoàn thành</h3>
            <p className="stat-number">{stats.completedOrders}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-number">{stats.todayRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Đơn hàng gần đây</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.total.toLocaleString('vi-VN')}đ</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' && 'Chờ xác nhận'}
                    {order.status === 'preparing' && 'Đang chuẩn bị'}
                    {order.status === 'delivering' && 'Đang giao'}
                    {order.status === 'completed' && 'Hoàn thành'}
                  </span>
                </td>
                <td>{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
