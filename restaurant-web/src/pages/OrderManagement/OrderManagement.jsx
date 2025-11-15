import { useState } from 'react'
import './OrderManagement.css'

function OrderManagement() {
  const [activeTab, setActiveTab] = useState('new')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [orders, setOrders] = useState([
    { 
      id: '1001', 
      customer: 'Nguyễn Văn A', 
      phone: '0912345678',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      items: [
        { name: 'Cơm Tấm Sườn', quantity: 2, price: 35000 }
      ],
      total: 70000,
      discount: 10000,
      platformFee: 5000,
      restaurantReceives: 55000,
      distance: 2.5,
      status: 'pending', 
      time: '10:30',
      note: 'Không hành',
      paymentMethod: 'ZaloPay'
    },
    { 
      id: '1002', 
      customer: 'Trần Thị B', 
      phone: '0923456789',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      items: [
        { name: 'Cơm Tấm Đặc Biệt', quantity: 1, price: 45000 }
      ],
      total: 45000,
      discount: 5000,
      platformFee: 4000,
      restaurantReceives: 36000,
      distance: 1.8,
      status: 'pending', 
      time: '10:25',
      note: '',
      paymentMethod: 'MoMo'
    },
    { 
      id: '1003', 
      customer: 'Lê Văn C', 
      phone: '0934567890',
      address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      items: [
        { name: 'Cơm Tấm Sườn Bì Chả', quantity: 1, price: 40000 },
        { name: 'Cơm Tấm Sườn', quantity: 1, price: 35000 }
      ],
      total: 75000,
      discount: 15000,
      platformFee: 6000,
      restaurantReceives: 54000,
      distance: 3.2, 
      status: 'confirmed', 
      time: '10:20',
      note: 'Giao gấp',
      paymentMethod: 'Thẻ tín dụng'
    },
    { 
      id: '1004', 
      customer: 'Phạm Thị D', 
      phone: '0945678901',
      address: '321 Võ Văn Tần, Quận 3, TP.HCM',
      items: [
        { name: 'Cơm Tấm Sườn', quantity: 1, price: 35000 }
      ],
      total: 35000,
      discount: 0,
      platformFee: 3500,
      restaurantReceives: 31500,
      distance: 2.1,
      status: 'confirmed', 
      time: '10:15',
      note: '',
      paymentMethod: 'ZaloPay'
    },
    { 
      id: '1005', 
      customer: 'Hoàng Văn E', 
      phone: '0956789012',
      address: '654 Pasteur, Quận 1, TP.HCM',
      items: [
        { name: 'Cơm Tấm Bì', quantity: 2, price: 32000 },
        { name: 'Cơm Tấm Chả', quantity: 1, price: 31000 }
      ],
      total: 95000,
      discount: 10000,
      platformFee: 8500,
      restaurantReceives: 76500,
      distance: 1.5,
      status: 'preparing', 
      time: '10:10',
      note: '',
      paymentMethod: 'MoMo'
    },
    { 
      id: '1006', 
      customer: 'Trương Thị F', 
      phone: '0967890123',
      address: '987 Cách Mạng Tháng 8, Quận 10, TP.HCM',
      items: [
        { name: 'Cơm Tấm Đặc Biệt', quantity: 3, price: 45000 }
      ],
      total: 135000,
      discount: 20000,
      platformFee: 11500,
      restaurantReceives: 103500,
      distance: 4.2,
      status: 'completed', 
      time: '09:50',
      note: '',
      paymentMethod: 'Thẻ tín dụng'
    },
    { 
      id: '1007', 
      customer: 'Võ Văn G', 
      phone: '0978901234',
      address: '159 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      items: [
        { name: 'Cơm Tấm Sườn', quantity: 1, price: 35000 },
        { name: 'Cơm Tấm Bì', quantity: 1, price: 35000 }
      ],
      total: 70000,
      discount: 7000,
      platformFee: 6300,
      restaurantReceives: 56700,
      distance: 3.8,
      status: 'completed', 
      time: '09:35',
      note: '',
      paymentMethod: 'ZaloPay'
    },
    { 
      id: '1008', 
      customer: 'Đặng Thị H', 
      phone: '0989012345',
      address: '753 Lý Thường Kiệt, Quận 11, TP.HCM',
      items: [
        { name: 'Cơm Tấm Sườn Bì Chả', quantity: 2, price: 45000 }
      ],
      total: 90000, 
      status: 'cancelled', 
      time: '09:20',
      note: 'Khách hủy',
      paymentMethod: 'MoMo'
    },
  ])

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ))
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const getFilteredOrders = () => {
    switch(activeTab) {
      case 'new':
        return orders.filter(order => order.status === 'pending')
      case 'confirmed':
        return orders.filter(order => ['confirmed', 'preparing', 'delivering'].includes(order.status))
      case 'history':
        return orders.filter(order => ['completed', 'cancelled'].includes(order.status))
      default:
        return orders
    }
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="order-management-page">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <p className="subtitle">Danh sách đơn hàng chờ xử lý</p>
      </div>

      <div className="order-tabs">
        <button 
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Đơn mới
          <span className="tab-count">{orders.filter(o => o.status === 'pending').length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          Đã xác nhận
          <span className="tab-count">{orders.filter(o => ['confirmed', 'preparing', 'delivering'].includes(o.status)).length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử
          <span className="tab-count">{orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length}</span>
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card" onClick={() => handleOrderClick(order)}>
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Đơn #{order.id}</span>
                  <span className="customer-name">{order.customer}</span>
                </div>
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'pending' && 'Chờ xác nhận'}
                  {order.status === 'confirmed' && 'Đã xác nhận'}
                  {order.status === 'preparing' && 'Đang chuẩn bị'}
                  {order.status === 'delivering' && 'Đang giao'}
                  {order.status === 'completed' && 'Hoàn thành'}
                  {order.status === 'cancelled' && 'Đã hủy'}
                </span>
              </div>

              <div className="order-details">
                <p className="order-items">
                  {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </p>
              </div>

              <div className="order-footer">
                <span className="order-time">🕐 {order.time}</span>
                <span className="order-total">{order.total.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'confirmed')} className="accept-btn btn-small">
                      Xác nhận
                    </button>
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="reject-btn btn-small">
                      Từ chối
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')} className="prepare-btn btn-small">
                    Sẵn sàng giao
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'delivering')} className="ready-btn btn-small">
                    Đang giao
                  </button>
                )}
                {order.status === 'delivering' && (
                  <button onClick={() => updateStatus(order.id, 'completed')} className="complete-btn btn-small">
                    Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-row">
                  <span className="label">Tên khách hàng:</span>
                  <span className="value">{selectedOrder.customer}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedOrder.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa chỉ giao hàng:</span>
                  <span className="value">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="info-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">#{selectedOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian đặt:</span>
                  <span className="value">{selectedOrder.time}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khoảng cách:</span>
                  <span className="value">{selectedOrder.distance} km</span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${selectedOrder.status}`}>
                    {selectedOrder.status === 'pending' && 'Chờ xác nhận'}
                    {selectedOrder.status === 'confirmed' && 'Đã xác nhận'}
                    {selectedOrder.status === 'preparing' && 'Đang chuẩn bị'}
                    {selectedOrder.status === 'delivering' && 'Đang giao'}
                    {selectedOrder.status === 'completed' && 'Hoàn thành'}
                    {selectedOrder.status === 'cancelled' && 'Đã hủy'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.note && (
                  <div className="info-row">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedOrder.note}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Chi tiết món ăn</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
                <div className="financial-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tổng tiền:</span>
                    <span className="summary-value">{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value discount">-{selectedOrder.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Chiết khấu nền tảng:</span>
                    <span className="summary-value fee">-{selectedOrder.platformFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Quán phải thu:</span>
                    <span className="total-value">{selectedOrder.restaurantReceives.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        updateStatus(selectedOrder.id, 'confirmed')
                        setShowDetailModal(false)
                      }} 
                      className="accept-btn"
                    >
                      Xác nhận đơn hàng
                    </button>
                    <button 
                      onClick={() => {
                        updateStatus(selectedOrder.id, 'cancelled')
                        setShowDetailModal(false)
                      }} 
                      className="reject-btn"
                    >
                      Từ chối đơn hàng
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedOrder.id, 'preparing')
                      setShowDetailModal(false)
                    }} 
                    className="prepare-btn"
                  >
                    Sẵn sàng giao hàng
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedOrder.id, 'delivering')
                      setShowDetailModal(false)
                    }} 
                    className="ready-btn"
                  >
                    Đang giao hàng
                  </button>
                )}
                {selectedOrder.status === 'delivering' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedOrder.id, 'completed')
                      setShowDetailModal(false)
                    }} 
                    className="complete-btn"
                  >
                    Hoàn thành giao hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement