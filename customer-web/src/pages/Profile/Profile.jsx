import { useSelector } from 'react-redux'
import './Profile.css'

function Profile() {
  const { user } = useSelector(state => state.auth)
  const { orders } = useSelector(state => state.order)

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Tài khoản của tôi</h1>

        <div className="profile-content">
          <div className="profile-card">
            <div className="avatar">
              👤
            </div>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{user?.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{user?.address}</span>
              </div>
            </div>

            <button className="edit-btn">Chỉnh sửa thông tin</button>
          </div>

          <div className="orders-section">
            <h2>Đơn hàng của tôi</h2>
            
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>Bạn chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-header">
                      <span className="order-id">Đơn #{order.id}</span>
                      <span className={`order-status ${order.status}`}>
                        {order.status === 'pending' && '⏳ Đang xử lý'}
                        {order.status === 'confirmed' && '✅ Đã xác nhận'}
                        {order.status === 'delivering' && '🚁 Đang giao'}
                        {order.status === 'completed' && '✔️ Hoàn thành'}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item.id} className="item">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <span>Tổng cộng:</span>
                      <span className="total-price">{order.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
