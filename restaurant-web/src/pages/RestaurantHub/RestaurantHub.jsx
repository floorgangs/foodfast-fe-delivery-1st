import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './RestaurantHub.css'

function RestaurantHub() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const [restaurants, setRestaurants] = useState([])
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  useEffect(() => {
    // Load danh sách nhà hàng từ localStorage
    const stored = window.localStorage.getItem('foodfastRestaurants')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRestaurants(parsed)
      } catch (error) {
        setRestaurants([])
      }
    } else {
      // Tạo nhà hàng mẫu để demo
      const demoRestaurants = [
        {
          id: 'demo-restaurant-001',
          name: 'Bún Bò Huế Mỹ Tho',
          location: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
          ownerName: 'Nguyễn Văn A',
          email: 'bunbohuemytho@gmail.com',
          phone: '0901234567',
          taxCode: '0123456789',
          taxRate: '4.5',
          cuisine: 'Ẩm thực Việt',
          approved: true,
          createdAt: '2024-01-15T08:30:00.000Z',
        },
        {
          id: 'demo-restaurant-002',
          name: 'Phở Hà Nội 24h',
          location: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
          ownerName: 'Trần Thị B',
          email: 'phohanoi24h@gmail.com',
          phone: '0912345678',
          taxCode: '0987654321',
          taxRate: '4.5',
          cuisine: 'Ẩm thực Việt',
          approved: false,
          createdAt: '2024-11-10T14:20:00.000Z',
        },
      ]
      setRestaurants(demoRestaurants)
      window.localStorage.setItem('foodfastRestaurants', JSON.stringify(demoRestaurants))
    }
  }, [])

  const handleSelectRestaurant = (restaurantId) => {
    // Lưu nhà hàng được chọn
    window.localStorage.setItem('selectedRestaurantId', restaurantId)
    navigate('/dashboard')
  }

  return (
    <div className="restaurant-hub">
      <header className="hub-header">
        <div className="hub-header-content">
          <div className="hub-brand">
            <span className="hub-logo">FF 🚁</span>
            <div>
              <h1>FoodFast Partner</h1>
              <p>Xin chào, {user?.name || 'Partner'}</p>
            </div>
          </div>
          <button type="button" className="hub-logout" onClick={() => navigate('/login')}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="hub-main">
        <section className="hub-intro">
          <h2>Quản lý nhà hàng của bạn</h2>
          <p>Chọn nhà hàng để quản lý hoặc đăng ký nhà hàng mới để tham gia FoodFast</p>
        </section>

        <div className="hub-grid">
          {/* Card đăng ký nhà hàng mới */}
          <button
            type="button"
            className="hub-card hub-card-register"
            onClick={() => setShowRegisterForm(true)}
          >
            <div className="hub-card-icon">
              <span>➕</span>
            </div>
            <h3>Đăng ký nhà hàng mới</h3>
            <p>Mở rộng kinh doanh với FoodFast</p>
          </button>

          {/* Danh sách nhà hàng đã đăng ký */}
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              className="hub-card hub-card-restaurant"
              onClick={() => handleSelectRestaurant(restaurant.id)}
            >
              <div className="hub-card-status">
                {restaurant.approved ? (
                  <span className="status-badge status-approved">✓ Đã duyệt</span>
                ) : (
                  <span className="status-badge status-pending">⏳ Chờ duyệt</span>
                )}
              </div>
              <h3>{restaurant.name}</h3>
              <p className="restaurant-address">{restaurant.location}</p>
              <div className="restaurant-meta">
                <span>📞 {restaurant.phone}</span>
                <span>🍽️ {restaurant.cuisine || 'Ẩm thực'}</span>
              </div>
            </button>
          ))}
        </div>

        {restaurants.length === 0 && !showRegisterForm && (
          <div className="hub-empty">
            <span className="empty-icon">🏪</span>
            <h3>Chưa có nhà hàng nào</h3>
            <p>Hãy đăng ký nhà hàng đầu tiên của bạn để bắt đầu</p>
          </div>
        )}
      </main>

      {showRegisterForm && (
        <RegisterRestaurantModal
          onClose={() => setShowRegisterForm(false)}
          onSuccess={(newRestaurant) => {
            setRestaurants([...restaurants, newRestaurant])
            setShowRegisterForm(false)
          }}
        />
      )}
    </div>
  )
}

function RegisterRestaurantModal({ onClose, onSuccess }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    location: '',
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    idCardFront: null,
    idCardBack: null,
    idIssueDate: '',
    idIssuePlace: '',
    businessLicense: null,
    taxCode: '',
    taxRate: '4.5',
    taxCertificate: null,
    relatedDocuments: [],
    bankName: 'Vietcombank',
    bankAccountNumber: '',
    bankAccountName: '',
    bankBranch: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name } = e.target
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }))
    }
  }

  const handleMultiFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, relatedDocuments: files }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Tạo object nhà hàng mới
    const newRestaurant = {
      id: `restaurant-${Date.now()}`,
      name: formData.name,
      location: formData.location,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      taxCode: formData.taxCode,
      taxRate: formData.taxRate,
      approved: false,
      createdAt: new Date().toISOString(),
    }

    // Lưu vào localStorage
    const stored = window.localStorage.getItem('foodfastRestaurants')
    let restaurants = []
    if (stored) {
      try {
        restaurants = JSON.parse(stored)
      } catch (error) {
        restaurants = []
      }
    }
    restaurants.push(newRestaurant)
    window.localStorage.setItem('foodfastRestaurants', JSON.stringify(restaurants))

    onSuccess(newRestaurant)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đăng ký nhà hàng mới</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-row">
              <label>
                Vị trí
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Địa chỉ đầy đủ"
                  required
                />
              </label>
              <label>
                Tên quán
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tên nhà hàng"
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Họ và tên
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Họ tên chủ sở hữu"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email liên hệ"
                  required
                />
              </label>
            </div>

            <label>
              Số điện thoại
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                required
              />
            </label>
          </div>

          <div className="form-section">
            <h3>Giấy tờ tùy thân</h3>
            <div className="form-row">
              <label className="file-label">
                CCCD/Hộ chiếu mặt trước
                <input type="file" name="idCardFront" onChange={handleFileChange} accept="image/*" required />
                <span className="file-button">📎 Chọn file</span>
                {formData.idCardFront && <span className="file-name">{formData.idCardFront.name}</span>}
              </label>
              <label className="file-label">
                CCCD/Hộ chiếu mặt sau
                <input type="file" name="idCardBack" onChange={handleFileChange} accept="image/*" required />
                <span className="file-button">📎 Chọn file</span>
                {formData.idCardBack && <span className="file-name">{formData.idCardBack.name}</span>}
              </label>
            </div>

            <div className="form-row">
              <label>
                Ngày cấp
                <input
                  type="date"
                  name="idIssueDate"
                  value={formData.idIssueDate}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Nơi cấp
                <input
                  type="text"
                  name="idIssuePlace"
                  value={formData.idIssuePlace}
                  onChange={handleChange}
                  placeholder="Cục cảnh sát ĐKQL cư trú và DLQG về dân cư"
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Giấy phép kinh doanh</h3>
            <label className="file-label">
              Ảnh giấy phép kinh doanh
              <input type="file" name="businessLicense" onChange={handleFileChange} accept="image/*" required />
              <span className="file-button">📎 Chọn file</span>
              {formData.businessLicense && <span className="file-name">{formData.businessLicense.name}</span>}
            </label>

            <div className="form-row">
              <label>
                Mã số thuế
                <input
                  type="text"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleChange}
                  placeholder="Mã số thuế"
                  required
                />
              </label>
              <label>
                Thuế suất
                <select name="taxRate" value={formData.taxRate} onChange={handleChange} required>
                  <option value="4.5">4,5%</option>
                  <option value="5">5%</option>
                  <option value="8">8%</option>
                  <option value="10">10%</option>
                </select>
              </label>
            </div>

            <label className="file-label">
              Ảnh chụp mã số thuế kinh doanh
              <input type="file" name="taxCertificate" onChange={handleFileChange} accept="image/*" required />
              <span className="file-button">📎 Chọn file</span>
              {formData.taxCertificate && <span className="file-name">{formData.taxCertificate.name}</span>}
            </label>
          </div>

          <div className="form-section">
            <h3>Giấy tờ liên quan</h3>
            <label className="file-label">
              Ảnh chụp giấy tờ liên quan (có thể chọn nhiều)
              <input type="file" multiple onChange={handleMultiFileChange} accept="image/*" />
              <span className="file-button">📎 Chọn files</span>
              {formData.relatedDocuments.length > 0 && (
                <span className="file-name">{formData.relatedDocuments.length} file đã chọn</span>
              )}
            </label>
          </div>

          <div className="form-section">
            <h3>Thông tin thanh toán</h3>
            <label>
              Ngân hàng
              <select name="bankName" value={formData.bankName} onChange={handleChange} required>
                <option value="Vietcombank">Vietcombank</option>
                <option value="BIDV">BIDV</option>
                <option value="VietinBank">VietinBank</option>
                <option value="Agribank">Agribank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MB Bank">MB Bank</option>
                <option value="ACB">ACB</option>
                <option value="VPBank">VPBank</option>
                <option value="TPBank">TPBank</option>
                <option value="Sacombank">Sacombank</option>
              </select>
            </label>

            <div className="form-row">
              <label>
                Số tài khoản
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Số tài khoản ngân hàng"
                  required
                />
              </label>
              <label>
                Tên tài khoản
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  placeholder="Tên tài khoản (viết hoa không dấu)"
                  required
                />
              </label>
            </div>

            <label>
              Chi nhánh
              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                placeholder="Chi nhánh ngân hàng"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Gửi đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantHub
