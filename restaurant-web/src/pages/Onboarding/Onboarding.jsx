import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRestaurant } from '../../store/slices/authSlice'
import './Onboarding.css'

const steps = [
  { id: 1, title: 'Thông tin cơ bản', description: 'Tên nhà hàng, loại hình kinh doanh' },
  { id: 2, title: 'Địa điểm & drone pad', description: 'Địa chỉ, khu vực đáp drone' },
  { id: 3, title: 'Giấy tờ pháp lý', description: 'Giấy phép kinh doanh, VSATTP' },
  { id: 4, title: 'Menu & giá bán', description: 'Tối thiểu 5 món chủ lực' },
]

function Onboarding() {
  const [activeStep, setActiveStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [createdRestaurant, setCreatedRestaurant] = useState(null)
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const newRestaurant = {
      id: `res-${Date.now()}`,
      name: formData.restaurantName,
      cuisine: formData.cuisine,
      phone: formData.phone,
      address: formData.address,
      district: formData.district,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      dronePad: formData.dronePad,
      brandStory: formData.brandStory,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('foodfastRegisteredRestaurants')
      let restaurants = []
      if (stored) {
        try {
          restaurants = JSON.parse(stored) || []
        } catch (error) {
          restaurants = []
        }
      }

      const updatedRestaurants = [newRestaurant, ...restaurants]
      window.localStorage.setItem('foodfastRegisteredRestaurants', JSON.stringify(updatedRestaurants))
      window.localStorage.setItem('foodfastLastRestaurantId', newRestaurant.id)
    }

    setCreatedRestaurant(newRestaurant)
    setActiveStep(4)
    setSubmitted(true)
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
                  <p>{createdRestaurant?.address || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="summary-label">Khu vực</span>
                  <p>{createdRestaurant?.district || 'Đang cập nhật'}</p>
                </div>
                <div>
                  <span className="summary-label">Drone pad</span>
                  <p>{createdRestaurant?.dronePad ? `${createdRestaurant.dronePad} m²` : 'Đang cập nhật'}</p>
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
              <div className="form-row">
                <label>
                  Tên nhà hàng
                  <input
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Ví dụ: Bún Bò Huế 24H"
                    required
                  />
                </label>
                <label>
                  Loại hình
                  <select name="cuisine" value={formData.cuisine} onChange={handleChange}>
                    <option value="vietnamese">Ẩm thực Việt</option>
                    <option value="thai">Ẩm thực Thái</option>
                    <option value="japanese">Ẩm thực Nhật</option>
                    <option value="fastfood">Fastfood</option>
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
                  />
                </label>
                <label>
                  Khu vực
                  <input name="district" value={formData.district} onChange={handleChange} placeholder="Quận/Huyện" />
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
                />
              </label>

              <div className="form-row">
                <label>
                  Giờ mở cửa
                  <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} />
                </label>
                <label>
                  Giờ đóng cửa
                  <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} />
                </label>
                <label>
                  Drone pad (m²)
                  <input
                    name="dronePad"
                    value={formData.dronePad}
                    onChange={handleChange}
                    placeholder="Ví dụ: 16"
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
                />
              </label>

              <div className="form-actions">
                <button type="button" onClick={() => setActiveStep(Math.max(1, activeStep - 1))}>
                  ← Trở lại
                </button>
                <button type="submit">Gửi hồ sơ</button>
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
