import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRestaurant } from '../../store/slices/authSlice'
import { restaurantAPI } from '../../services/api'
import './RestaurantSelection.css'

function RestaurantSelection() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: user?.phone || '',
    address: '',
    email: user?.email || '',
    idCardFront: null,
    idCardBack: null,
    idCardNumber: '',
    idCardIssueDate: '',
    idCardIssuePlace: '',
    businessLicense: null,
    taxCode: '',
    taxRate: '4.5',
    taxCertificate: null,
    relatedDocuments: [],
  })

  useEffect(() => {
    loadRestaurants()
  }, [user])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Gọi API lấy nhà hàng của user đăng nhập
      const response = await restaurantAPI.getMyRestaurant()
      
      if (response?.success) {
        // API có thể trả về 1 object hoặc 1 mảng
        const data = response.data
        if (Array.isArray(data)) {
          setRestaurants(data)
        } else if (data) {
          setRestaurants([data])
        } else {
          setRestaurants([])
        }
      } else {
        setRestaurants([])
      }
    } catch (err) {
      // Nếu lỗi "Bạn chưa có nhà hàng", đó là trường hợp bình thường
      if (err?.message === 'Bạn chưa có nhà hàng') {
        setRestaurants([])
      } else {
        setError(err?.message || 'Đã xảy ra lỗi khi tải nhà hàng')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRestaurant = async (restaurantId) => {
    try {
      const response = await restaurantAPI.getById(restaurantId)
      if (response?.success && response.data) {
        dispatch(setRestaurant(response.data))
        navigate('/dashboard')
      } else {
        throw new Error('Không thể chọn nhà hàng')
      }
    } catch (err) {
      alert(err?.message || 'Không thể chọn nhà hàng')
    }
  }

  const handleFileChange = (e) => {
    const { name } = e.target
    const file = e.target.files[0]
    
    if (name === 'relatedDocuments') {
      const files = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, relatedDocuments: files }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: file }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitRegistration = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    try {
      // TODO: Implement file upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll send data without files
      const payload = {
        name: formData.restaurantName,
        phone: formData.phone,
        email: formData.email,
        address: {
          street: formData.address,
          city: 'Hồ Chí Minh',
        },
        description: `Nhà hàng ${formData.restaurantName}`,
        cuisine: ['Ẩm thực Việt'],
        openingHours: {
          monday: { open: '08:00', close: '22:00', isOpen: true },
          tuesday: { open: '08:00', close: '22:00', isOpen: true },
          wednesday: { open: '08:00', close: '22:00', isOpen: true },
          thursday: { open: '08:00', close: '22:00', isOpen: true },
          friday: { open: '08:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '22:00', isOpen: true },
          sunday: { open: '08:00', close: '22:00', isOpen: true },
        },
        estimatedDeliveryTime: '20-30 phút',
        deliveryFee: 15000,
        minOrder: 50000,
        isActive: false, // Pending approval
        metadata: {
          idCardNumber: formData.idCardNumber,
          idCardIssueDate: formData.idCardIssueDate,
          idCardIssuePlace: formData.idCardIssuePlace,
          taxCode: formData.taxCode,
          taxRate: formData.taxRate,
        },
      }

      const response = await restaurantAPI.create(payload)

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể đăng ký nhà hàng')
      }

      alert('Đăng ký nhà hàng thành công! Vui lòng chờ duyệt.')
      setShowRegisterModal(false)
      loadRestaurants()
    } catch (err) {
      setSubmitError(err?.message || 'Không thể đăng ký nhà hàng')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="selection-container">
        <div className="selection-loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách nhà hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="selection-container">
      <div className="selection-header">
        <div className="header-content">
          <h1>Chọn nhà hàng quản lý</h1>
          <p>Chọn nhà hàng bạn muốn quản lý hoặc đăng ký nhà hàng mới</p>
        </div>
      </div>

      {error && (
        <div className="selection-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={loadRestaurants}>Thử lại</button>
        </div>
      )}

      <div className="selection-grid">
        {/* Card Đăng ký nhà hàng mới */}
        <div className="restaurant-card add-new" onClick={() => setShowRegisterModal(true)}>
          <div className="card-icon">
            <span>➕</span>
          </div>
          <h3>Đăng ký nhà hàng mới</h3>
          <p>Thêm nhà hàng của bạn vào FoodFast</p>
        </div>

        {/* Danh sách nhà hàng */}
        {restaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            className="restaurant-card"
            onClick={() => handleSelectRestaurant(restaurant._id)}
          >
            <div className="card-image">
              {restaurant.images?.[0] ? (
                <img src={restaurant.images[0]} alt={restaurant.name} />
              ) : (
                <div className="placeholder-image">🍽️</div>
              )}
            </div>
            <div className="card-content">
              <h3>{restaurant.name}</h3>
              <p className="card-address">
                {restaurant.address?.street}, {restaurant.address?.district}
              </p>
              <div className="card-meta">
                <span className={`status ${restaurant.isApproved ? 'approved' : 'pending'}`}>
                  {restaurant.isApproved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                </span>
                <span className={`active ${restaurant.isActive ? 'yes' : 'no'}`}>
                  {restaurant.isActive ? '🟢 Hoạt động' : '🔴 Tạm đóng'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Đăng ký nhà hàng */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đăng ký nhà hàng mới</h2>
              <button className="modal-close" onClick={() => setShowRegisterModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="register-form">
              {submitError && (
                <div className="form-error">
                  <span>⚠️</span>
                  <p>{submitError}</p>
                </div>
              )}

              {/* Thông tin cơ bản */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                <div className="form-row">
                  <label>
                    Tên quán <span className="required">*</span>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Phở Hà Nội"
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Số điện thoại liên hệ <span className="required">*</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0901234567"
                      required
                      disabled={submitting}
                    />
                  </label>
                  <label>
                    Email <span className="required">*</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Địa chỉ <span className="required">*</span>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, đường, phường, quận"
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>
              </div>

              {/* Thông tin CCCD */}
              <div className="form-section">
                <h3>Thông tin CCCD</h3>
                <div className="form-row">
                  <label>
                    Ảnh CCCD mặt trước <span className="required">*</span>
                    <input
                      type="file"
                      name="idCardFront"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={submitting}
                    />
                    {formData.idCardFront && (
                      <span className="file-name">📄 {formData.idCardFront.name}</span>
                    )}
                  </label>
                  <label>
                    Ảnh CCCD mặt sau <span className="required">*</span>
                    <input
                      type="file"
                      name="idCardBack"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={submitting}
                    />
                    {formData.idCardBack && (
                      <span className="file-name">📄 {formData.idCardBack.name}</span>
                    )}
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Số CCCD <span className="required">*</span>
                    <input
                      type="text"
                      name="idCardNumber"
                      value={formData.idCardNumber}
                      onChange={handleInputChange}
                      placeholder="001234567890"
                      required
                      disabled={submitting}
                    />
                  </label>
                  <label>
                    Ngày cấp <span className="required">*</span>
                    <input
                      type="date"
                      name="idCardIssueDate"
                      value={formData.idCardIssueDate}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                  </label>
                  <label>
                    Nơi cấp <span className="required">*</span>
                    <input
                      type="text"
                      name="idCardIssuePlace"
                      value={formData.idCardIssuePlace}
                      onChange={handleInputChange}
                      placeholder="Cục Cảnh sát QLHC về TTXH"
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>
              </div>

              {/* Giấy phép kinh doanh */}
              <div className="form-section">
                <h3>Giấy phép kinh doanh</h3>
                <div className="form-row">
                  <label>
                    Ảnh giấy phép kinh doanh <span className="required">*</span>
                    <input
                      type="file"
                      name="businessLicense"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={submitting}
                    />
                    {formData.businessLicense && (
                      <span className="file-name">📄 {formData.businessLicense.name}</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Thông tin thuế */}
              <div className="form-section">
                <h3>Thông tin thuế</h3>
                <div className="form-row">
                  <label>
                    Mã số thuế <span className="required">*</span>
                    <input
                      type="text"
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleInputChange}
                      placeholder="0123456789"
                      required
                      disabled={submitting}
                    />
                  </label>
                  <label>
                    Thuế suất <span className="required">*</span>
                    <select
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    >
                      <option value="4.5">4.5%</option>
                      <option value="5">5%</option>
                      <option value="8">8%</option>
                      <option value="10">10%</option>
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Ảnh chứng nhận thuế <span className="required">*</span>
                    <input
                      type="file"
                      name="taxCertificate"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      disabled={submitting}
                    />
                    {formData.taxCertificate && (
                      <span className="file-name">📄 {formData.taxCertificate.name}</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Giấy tờ liên quan */}
              <div className="form-section">
                <h3>Giấy tờ liên quan (nếu có)</h3>
                <div className="form-row">
                  <label>
                    Ảnh các giấy tờ khác
                    <input
                      type="file"
                      name="relatedDocuments"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                    {formData.relatedDocuments.length > 0 && (
                      <span className="file-name">
                        📄 {formData.relatedDocuments.length} file được chọn
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner"></span>
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantSelection
