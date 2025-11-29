import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { orderAPI } from '../../services/api'
import './Statistics.css'

function Statistics() {
  const { restaurant } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    today: { orders: 0, revenue: 0 },
    week: { orders: 0, revenue: 0 },
    month: { orders: 0, revenue: 0 },
  })
  const [topDishes, setTopDishes] = useState([])

  useEffect(() => {
    if (restaurant?._id) {
      loadStatistics()
    }
  }, [restaurant])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getMyOrders()

      if (response?.success) {
        const orders = response.data || []
        
        // Today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          orderDate.setHours(0, 0, 0, 0)
          return orderDate.getTime() === today.getTime()
        })
        
        // This week (last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        weekAgo.setHours(0, 0, 0, 0)
        
        const weekOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekAgo
        })
        
        // This month
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= monthStart
        })
        
        // Calculate revenues
        const calculateRevenue = (orderList) => {
          return orderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        }
        
        setStats({
          today: {
            orders: todayOrders.length,
            revenue: calculateRevenue(todayOrders)
          },
          week: {
            orders: weekOrders.length,
            revenue: calculateRevenue(weekOrders)
          },
          month: {
            orders: monthOrders.length,
            revenue: calculateRevenue(monthOrders)
          }
        })
        
        // Calculate top dishes
        const dishMap = {}
        orders.forEach(order => {
          order.items?.forEach(item => {
            const dishName = item.product?.name || item.name || 'Món ăn'
            if (!dishMap[dishName]) {
              dishMap[dishName] = { name: dishName, sold: 0, revenue: 0 }
            }
            dishMap[dishName].sold += item.quantity || 1
            dishMap[dishName].revenue += (item.price || 0) * (item.quantity || 1)
          })
        })
        
        const sortedDishes = Object.values(dishMap)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10)
        
        setTopDishes(sortedDishes)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="statistics-page">
        <h1>Thống kê</h1>
        <div className="loading-container">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="statistics-page">
      <h1>Thống kê</h1>

      <div className="stats-period-grid">
        <div className="period-card">
          <h3>Hôm nay</h3>
          <p className="period-orders">{stats.today.orders} đơn</p>
          <p className="period-revenue">{stats.today.revenue.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="period-card">
          <h3>7 ngày qua</h3>
          <p className="period-orders">{stats.week.orders} đơn</p>
          <p className="period-revenue">{stats.week.revenue.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="period-card">
          <h3>Tháng này</h3>
          <p className="period-orders">{stats.month.orders} đơn</p>
          <p className="period-revenue">{stats.month.revenue.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      <div className="top-dishes">
        <h2>Món bán chạy nhất</h2>
        {topDishes.length === 0 ? (
          <p className="empty-message">Chưa có dữ liệu bán hàng</p>
        ) : (
          <table className="dishes-table">
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish, index) => (
                <tr key={index}>
                  <td>{dish.name}</td>
                  <td>{dish.sold}</td>
                  <td>{dish.revenue.toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Statistics
