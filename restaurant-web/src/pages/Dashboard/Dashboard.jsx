import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard() {
  const { restaurant } = useSelector(state => state.auth)
  const [stats, setStats] = useState({
    todayOrders: 45,
    pendingOrders: 8,
    completedOrders: 37,
    todayRevenue: 12500000,
    monthRevenue: 285000000,
    avgOrderValue: 278000,
    newCustomers: 12,
    topDishes: [
      { name: 'Phở bò đặc biệt', orders: 18, revenue: 1980000 },
      { name: 'Bún chả Hà Nội', orders: 15, revenue: 1350000 },
      { name: 'Cơm tấm sườn', orders: 12, revenue: 960000 },
    ]
  })

  const [recentOrders, setRecentOrders] = useState([
    { id: 'FF1001', customer: 'Nguyễn Văn A', total: 125000, status: 'pending', time: '10:30', items: 2 },
    { id: 'FF1002', customer: 'Trần Thị B', total: 85000, status: 'preparing', time: '10:25', items: 1 },
    { id: 'FF1003', customer: 'Lê Văn C', total: 150000, status: 'delivering', time: '10:20', items: 3 },
    { id: 'FF1004', customer: 'Phạm Thị D', total: 95000, status: 'completed', time: '10:15', items: 2 },
    { id: 'FF1005', customer: 'Hoàng Văn E', total: 210000, status: 'completed', time: '10:10', items: 4 },
  ])

  // Revenue chart data for last 7 days
  const revenueChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: [8500000, 9200000, 8800000, 11500000, 13200000, 14800000, 12500000],
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#eee',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString('vi-VN')}đ`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${(value / 1000000).toFixed(1)}M`
        },
        grid: {
          color: '#f0f0f0'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p className="welcome-text">Chào mừng đến với {restaurant?.name}</p>
        </div>
        <div className="date-selector">
          <select className="date-range">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>Tháng này</option>
            <option>Tháng trước</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card today">
          <div className="stat-header">
            <span className="stat-trend up">+12%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{stats.todayOrders}</p>
            <h3>Đơn hôm nay</h3>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-header">
            <span className="stat-badge">{stats.pendingOrders} mới</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{stats.pendingOrders}</p>
            <h3>Đơn chờ xử lý</h3>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-trend up">+8%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{(stats.todayRevenue / 1000000).toFixed(1)}M</p>
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-detail">Tháng: {(stats.monthRevenue / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        <div className="stat-card avg">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <span className="stat-trend up">+5%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{(stats.avgOrderValue / 1000).toFixed(0)}K</p>
            <h3>Giá trị TB/đơn</h3>
            <p className="stat-detail">{stats.newCustomers} khách mới</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="revenue-chart-section">
          <div className="section-header">
            <h2>Biểu đồ doanh thu</h2>
            <span className="chart-period">7 ngày qua</span>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="top-dishes-section">
          <div className="section-header">
            <h2>Món bán chạy</h2>
            <a href="/menu-management" className="view-all">Xem tất cả →</a>
          </div>
          <div className="dishes-list">
            {stats.topDishes.map((dish, index) => (
              <div key={index} className="dish-item">
                <div className="dish-rank">{index + 1}</div>
                <div className="dish-info">
                  <h4>{dish.name}</h4>
                  <p>{dish.orders} đơn • {dish.revenue.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="dish-chart">
                  <div 
                    className="dish-bar" 
                    style={{ width: `${(dish.orders / 18) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h2>Đơn hàng gần đây</h2>
          <a href="/order-management" className="view-all">Xem tất cả →</a>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số món</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="order-row">
                <td className="order-id">#{order.id}</td>
                <td className="customer-name">{order.customer}</td>
                <td>{order.items} món</td>
                <td className="order-total">{order.total.toLocaleString('vi-VN')}đ</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' && 'Chờ xác nhận'}
                    {order.status === 'preparing' && 'Đang chuẩn bị'}
                    {order.status === 'delivering' && 'Đang giao'}
                    {order.status === 'completed' && '✓ Hoàn thành'}
                  </span>
                </td>
                <td className="order-time">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
