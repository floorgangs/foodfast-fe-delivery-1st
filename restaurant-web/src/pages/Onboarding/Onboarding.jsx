import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRestaurant } from '../../store/slices/authSlice'
import { restaurantAPI } from '../../services/api'
import './Onboarding.css'

const steps = [
  { id: 1, title: 'Thông tin cơ bản', description: 'Tên nhà hàng, loại hình kinh doanh' },
  { id: 2, title: 'Địa điểm & drone pad', description: 'Địa chỉ, khu vực đáp drone' },
  { id: 3, title: 'Giấy tờ pháp lý', description: 'Giấy phép kinh doanh, VSATTP' },
  { id: 4, title: 'Menu & giá bán', description: 'Tối thiểu 5 món chủ lực' },
]

const cuisineOptions = [
  { value: 'vietnamese', label: 'Ẩm thực Việt' },
  { value: 'thai', label: 'Ẩm thực Thái' },
  { value: 'japanese', label: 'Ẩm thực Nhật' },
  { value: 'fastfood', label: 'Fastfood' },
]

function Onboarding() {
  const [activeStep, setActiveStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [createdRestaurant, setCreatedRestaurant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisine: 'vietnamese',
    phone: '',
    address: '',
    district: '',
    openTime: '08:00',
    closeTime: '22:00',
    dronePad: '',
    brandStory: '',
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const cuisineLabel = cuisineOptions.find((option) => option.value === formData.cuisine)?.label
      const payload = {
        name: formData.restaurantName,
        description: formData.brandStory || `Nhà hàng ${formData.restaurantName}`,
        cuisine: [cuisineLabel || 'Ẩm thực Việt'],
        phone: formData.phone,
        email: user?.email,
        address: {
          street: formData.address,
          district: formData.district,
          city: 'Hồ Chí Minh',
        },
        openingHours: {
          monday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          tuesday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          wednesday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          thursday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          friday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          saturday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
          sunday: { open: formData.openTime, close: formData.closeTime, isOpen: true },
        },
        estimatedDeliveryTime: '20-30 phút',
        deliveryFee: 15000,
        minOrder: 50000,
        isActive: true,
      }

      if (formData.dronePad) {
        payload.dronePadSize = Number(formData.dronePad)
        payload.tags = [`Drone pad ${formData.dronePad}m²`]
      }

      const response = await restaurantAPI.create(payload)

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể tạo nhà hàng')
      }

      setCreatedRestaurant(response.data)
      dispatch(setRestaurant(response.data))
      setActiveStep(4)
      setSubmitted(true)
    } catch (apiError) {
      const errorMsg = apiError?.message || apiError?.error || 'Không thể gửi hồ sơ. Vui lòng thử lại.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleManageNewRestaurant = () => {
    if (!createdRestaurant) return
    dispatch(setRestaurant(createdRestaurant))
    navigate('/dashboard')
  }

  const handleBackToHub = () => {
    navigate('/')
  }

  const handleEditSubmission = () => {
    setSubmitted(false)
    setActiveStep(1)
  }

  return (
    <div className="onboarding-wrapper">
      <section className="onboarding-banner">
        <div className="banner-copy">
          <p className="banner-eyebrow">FoodFast Partner</p>
          <h1>
            Đăng ký gian hàng FoodFast
            <span> &nbsp;trong 24 giờ</span>
          </h1>
          <p className="banner-subtitle">
            Tối ưu chi phí vận hành với đội ngũ drone giao hàng, chuẩn hóa quy trình giống ShopeeFood nhưng nhanh hơn
            và trực quan hơn cho nhà hàng của bạn.
          </p>
          <div className="banner-actions">
            <a href="#register" className="banner-primary">
              Bắt đầu đăng ký
            </a>
            <button type="button" className="banner-secondary" onClick={() => setActiveStep(1)}>
              Xem các bước onboard
            </button>
          </div>
          <ul className="banner-highlights">
            <li>
              <strong>15 phút</strong>
              <span>Kiểm duyệt hồ sơ</span>
            </li>
            <li>
              <strong>99%</strong>
              <span>Đơn giao thành công</span>
            </li>
            <li>
              <strong>0₫</strong>
              <span>Phí khởi động</span>
            </li>
          </ul>
        </div>
        <div className="banner-visual" aria-hidden="true">
          <div className="visual-card">
            <img
              src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80"
              alt="Đầu bếp FoodFast"
            />
            <div className="visual-badge">
              <span>🚁</span>
              <div>
                <strong>FoodFast Drone</strong>
                <p>Giao hàng tức thì</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="onboarding-page" id="register">
        <section className="onboarding-hero">
          <p className="eyebrow">FoodFast Partner</p>
          <h1>Đăng ký nhà hàng & cất cánh cùng drone FoodFast</h1>
          <p className="description">
            Hoàn tất 4 bước cơ bản để đội ngũ FoodFast kích hoạt gian hàng của bạn. Thời gian duyệt trung bình chỉ 24 giờ
            làm việc.
          </p>
          <div className="hero-cards">
            <article>
              <span>🚁</span>
              <div>
                <strong>Drone pad tối thiểu</strong>
                <p>4m x 4m, khu vực trống, an toàn</p>
              </div>
            </article>
            <article>
              <span>📸</span>
              <div>
                <strong>Hình ảnh món ăn</strong>
                <p>Tối thiểu 3 hình/nhà hàng</p>
              </div>
            </article>
            <article>
              <span>💳</span>
              <div>
                <strong>Đối soát hằng ngày</strong>
                <p>Ví FoodFast Partner</p>
              </div>
            </article>
          </div>
        </section>

        <section className="onboarding-main">
          <div className="stepper">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`step ${activeStep === step.id ? 'active' : ''} ${step.id < activeStep ? 'done' : ''}`}
                onClick={() => setActiveStep(step.id)}
              >
                <span className="index">{step.id}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="form-wrapper">
            {submitted ? (
              <div className="success-panel">
                <h2>🎉 Hoàn tất đăng ký</h2>
                <p>
                  FoodFast đã nhận thông tin. Chúng tôi sẽ liên hệ trong 24h để xác minh và kích hoạt gian hàng cho
                  <strong> {createdRestaurant?.name}</strong>.
                </p>
                <div className="success-summary">
                  <div>
                    <span className="summary-label">Địa điểm</span>
                    <p>
                      {createdRestaurant?.address?.street || 'Chưa cập nhật'}
                      {createdRestaurant?.address?.district ? `, ${createdRestaurant.address.district}` : ''}
                      {createdRestaurant?.address?.city ? `, ${createdRestaurant.address.city}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="summary-label">Khu vực</span>
                    <p>{createdRestaurant?.address?.district || 'Đang cập nhật'}</p>
                  </div>
                  <div>
                    <span className="summary-label">Drone pad</span>
                    <p>
                      {createdRestaurant?.dronePadSize
                        ? `${createdRestaurant.dronePadSize} m²`
                        : 'Đang cập nhật'}
                    </p>
                  </div>
                  <div>
                    <span className="summary-label">Trạng thái</span>
                    <p>{createdRestaurant?.isApproved ? 'Đã duyệt' : 'Đang chờ duyệt'}</p>
                  </div>
                </div>
                <div className="success-actions">
                  <button type="button" onClick={handleEditSubmission} className="hub-secondary">
                    Chỉnh sửa hồ sơ
                  </button>
                  <button type="button" onClick={handleBackToHub} className="hub-secondary">
                    Về trung tâm đối tác
                  </button>
                  <button type="button" onClick={handleManageNewRestaurant} className="hub-primary">
                    Quản lý nhà hàng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="form-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                <div className="form-row">
                  <label>
                    Tên nhà hàng
                    <input
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      placeholder="Ví dụ: Bún Bò Huế 24H"
                      required
                      disabled={loading}
                    />
                  </label>
                  <label>
                    Loại hình
                    <select name="cuisine" value={formData.cuisine} onChange={handleChange} disabled={loading}>
                      {cuisineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Số điện thoại liên hệ
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="090xxxxxxx"
                      required
                      disabled={loading}
                    />
                  </label>
                  <label>
                    Khu vực
                    <input 
                      name="district" 
                      value={formData.district} 
                      onChange={handleChange} 
                      placeholder="Quận/Huyện"
                      disabled={loading}
                    />
                  </label>
                </div>

                <label>
                  Địa chỉ chi tiết
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường"
                    required
                    disabled={loading}
                  />
                </label>

                <div className="form-row">
                  <label>
                    Giờ mở cửa
                    <input 
                      type="time" 
                      name="openTime" 
                      value={formData.openTime} 
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </label>
                  <label>
                    Giờ đóng cửa
                    <input 
                      type="time" 
                      name="closeTime" 
                      value={formData.closeTime} 
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </label>
                  <label>
                    Drone pad (m²)
                    <input
                      name="dronePad"
                      value={formData.dronePad}
                      onChange={handleChange}
                      placeholder="Ví dụ: 16"
                      disabled={loading}
                    />
                  </label>
                </div>

                <label>
                  Câu chuyện thương hiệu
                  <textarea
                    name="brandStory"
                    value={formData.brandStory}
                    onChange={handleChange}
                    placeholder="Chia sẻ về món chủ lực, phong cách phục vụ..."
                    rows={4}
                    disabled={loading}
                  />
                </label>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    disabled={loading}
                  >
                    ← Trở lại
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi hồ sơ'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Onboarding
