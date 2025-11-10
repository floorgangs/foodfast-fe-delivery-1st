import { useState } from 'react'
import './OrderMonitoring.css'

function OrderMonitoring() {
  const [orders] = useState([
    { id: '1001', customer: 'Nguyễn Văn A', restaurant: 'Cơm Tấm Sài Gòn', total: 70000, status: 'delivering', drone: 'DR-001' },
    { id: '1002', customer: 'Trần Thị B', restaurant: 'Bún Bò Huế', total: 45000, status: 'preparing', drone: '-' },
    { id: '1003', customer: 'Lê Văn C', restaurant: 'KFC Vietnam', total: 150000, status: 'confirmed', drone: '-' },
  ])

  return (
    <div className="order-monitoring-page">
      <h1>Giám sát đơn hàng</h1>
      <p className="subtitle">Theo dõi tất cả đơn hàng trong hệ thống</p>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Nhà hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Drone</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.restaurant}</td>
              <td>{order.total.toLocaleString('vi-VN')}đ</td>
              <td>
                <span className={`status ${order.status}`}>
                  {order.status === 'confirmed' && '✅ Đã xác nhận'}
                  {order.status === 'preparing' && '👨‍🍳 Đang chuẩn bị'}
                  {order.status === 'delivering' && '🚁 Đang giao'}
                </span>
              </td>
              <td>{order.drone}</td>
              <td>
                <button className="track-btn">Theo dõi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrderMonitoring
