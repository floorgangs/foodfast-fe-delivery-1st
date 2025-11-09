import { useState } from 'react'
import './RestaurantManagement.css'

function RestaurantManagement() {
  const [restaurants] = useState([
    { id: '1', name: 'Cơm Tấm Sài Gòn', address: '123 Nguyễn Huệ, Q.1', phone: '0901111111', rating: 4.5, orders: 350, status: 'active' },
    { id: '2', name: 'Bún Bò Huế 24H', address: '456 Lê Lợi, Q.1', phone: '0902222222', rating: 4.7, orders: 298, status: 'active' },
    { id: '3', name: 'KFC Vietnam', address: '789 Võ Văn Tần, Q.3', phone: '0903333333', rating: 4.3, orders: 276, status: 'active' },
  ])

  return (
    <div className="restaurant-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhà hàng</h1>
          <p className="subtitle">Tổng số nhà hàng: {restaurants.length}</p>
        </div>
        <button className="add-btn">+ Thêm nhà hàng</button>
      </div>

      <div className="restaurants-grid">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="restaurant-card">
            <h3>{restaurant.name}</h3>
            <p className="address">📍 {restaurant.address}</p>
            <p className="phone">📞 {restaurant.phone}</p>
            <div className="restaurant-stats">
              <span>⭐ {restaurant.rating}</span>
              <span>📦 {restaurant.orders} đơn</span>
            </div>
            <span className={`status ${restaurant.status}`}>
              {restaurant.status === 'active' ? 'Đang hoạt động' : 'Tạm đóng'}
            </span>
            <div className="card-actions">
              <button className="view-btn">Xem chi tiết</button>
              <button className="edit-btn">Chỉnh sửa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RestaurantManagement
