import './Statistics.css'

function Statistics() {
  const stats = {
    today: { orders: 45, revenue: 12500000 },
    week: { orders: 280, revenue: 78000000 },
    month: { orders: 1200, revenue: 335000000 },
  }

  const topDishes = [
    { name: 'Cơm Tấm Sườn Nướng', sold: 150, revenue: 5250000 },
    { name: 'Cơm Tấm Sườn Bì Chả', sold: 120, revenue: 4800000 },
    { name: 'Cơm Tấm Đặc Biệt', sold: 95, revenue: 4275000 },
  ]

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
          <h3>Tuần này</h3>
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
      </div>
    </div>
  )
}

export default Statistics
