import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './OrderTracking.css'

function OrderTracking() {
  const { orderId } = useParams()
  const [orderStatus, setOrderStatus] = useState('confirmed')
  const [dronePosition, setDronePosition] = useState(0)

  const statusSteps = [
    { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
    { key: 'preparing', label: 'Đang chuẩn bị', icon: '👨‍🍳' },
    { key: 'drone_ready', label: 'Drone sẵn sàng', icon: '🚁' },
    { key: 'delivering', label: 'Đang giao hàng', icon: '📦' },
    { key: 'completed', label: 'Đã giao', icon: '🎉' }
  ]

  useEffect(() => {
    // Simulate order status progression
    const statusSequence = ['confirmed', 'preparing', 'drone_ready', 'delivering', 'completed']
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++
        setOrderStatus(statusSequence[currentIndex])
        setDronePosition(currentIndex * 25)
      } else {
        clearInterval(interval)
      }
    }, 5000) // Change status every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentStepIndex = statusSteps.findIndex(step => step.key === orderStatus)

  return (
    <div className="order-tracking-page">
      <div className="container">
        <h1>Theo dõi đơn hàng</h1>
        <p className="order-id">Mã đơn: #{orderId}</p>

        <div className="tracking-card">
          <div className="status-timeline">
            {statusSteps.map((step, index) => (
              <div 
                key={step.key} 
                className={`status-step ${index <= currentStepIndex ? 'active' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          <div className="drone-tracking">
            <h2>🚁 Vị trí Drone</h2>
            <div className="map-container">
              <div className="map-placeholder">
                <div 
                  className="drone-marker" 
                  style={{ left: `${dronePosition}%` }}
                >
                  🚁
                </div>
                <div className="route-line"></div>
                <div className="location-marker start">🏪 Nhà hàng</div>
                <div className="location-marker end">🏠 Bạn</div>
              </div>
            </div>
          </div>

          <div className="order-details">
            <h3>Chi tiết đơn hàng</h3>
            <div className="detail-row">
              <span>Thời gian đặt:</span>
              <span>{new Date().toLocaleString('vi-VN')}</span>
            </div>
            <div className="detail-row">
              <span>Thời gian dự kiến:</span>
              <span>15-20 phút</span>
            </div>
            <div className="detail-row">
              <span>Phương thức thanh toán:</span>
              <span>COD</span>
            </div>
            <div className="detail-row">
              <span>Địa chỉ giao hàng:</span>
              <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
            </div>
          </div>

          {orderStatus === 'completed' && (
            <div className="completion-message">
              <h2>🎉 Đơn hàng đã được giao thành công!</h2>
              <p>Cảm ơn bạn đã sử dụng FoodFast</p>
              <button className="rate-btn">Đánh giá đơn hàng</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
