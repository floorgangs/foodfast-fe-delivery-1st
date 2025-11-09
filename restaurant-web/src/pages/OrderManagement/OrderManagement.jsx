import { useState } from 'react'
import './OrderManagement.css'

function OrderManagement() {
  const [orders, setOrders] = useState([
    { id: '1001', customer: 'Nguyễn Văn A', items: 'Cơm Tấm Sườn x2', total: 70000, status: 'pending', time: '10:30' },
    { id: '1002', customer: 'Trần Thị B', items: 'Cơm Tấm Đặc Biệt x1', total: 45000, status: 'preparing', time: '10:25' },
    { id: '1003', customer: 'Lê Văn C', items: 'Cơm Tấm Sườn Bì Chả x1, Cơm Tấm Sườn x1', total: 75000, status: 'delivering', time: '10:20' },
  ])

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ))
  }

  return (
    <div className="order-management-page">
      <h1>Quản lý đơn hàng</h1>
      <p className="subtitle">Danh sách đơn hàng chờ xử lý</p>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Đơn #{order.id}</h3>
                <p className="customer-name">{order.customer}</p>
              </div>
              <span className={`status-badge ${order.status}`}>
                {order.status === 'pending' && '⏳ Chờ xác nhận'}
                {order.status === 'preparing' && '👨‍🍳 Đang chuẩn bị'}
                {order.status === 'delivering' && '🚁 Đang giao'}
                {order.status === 'completed' && '✅ Hoàn thành'}
              </span>
            </div>

            <div className="order-details">
              <p className="order-items">{order.items}</p>
              <p className="order-time">⏰ {order.time}</p>
              <p className="order-total">💰 {order.total.toLocaleString('vi-VN')}đ</p>
            </div>

            <div className="order-actions">
              {order.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(order.id, 'preparing')} className="accept-btn">
                    Xác nhận
                  </button>
                  <button className="reject-btn">Từ chối</button>
                </>
              )}
              {order.status === 'preparing' && (
                <button onClick={() => updateStatus(order.id, 'delivering')} className="ready-btn">
                  Sẵn sàng giao
                </button>
              )}
              {order.status === 'delivering' && (
                <button onClick={() => updateStatus(order.id, 'completed')} className="complete-btn">
                  Hoàn thành
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderManagement
