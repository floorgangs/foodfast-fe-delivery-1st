import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRestaurant } from '../../store/slices/authSlice'
import './PartnerHub.css'

function PartnerHub() {
  const [account, setAccount] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const loadFromStorage = () => {
      const storedAccount = window.localStorage.getItem('foodfastPartnerAccount')
      if (storedAccount) {
        try {
          setAccount(JSON.parse(storedAccount))
        } catch (error) {
          setAccount(null)
        }
      }

      const storedRestaurants = window.localStorage.getItem('foodfastRegisteredRestaurants')
      if (storedRestaurants) {
        try {
          setRestaurants(JSON.parse(storedRestaurants) || [])
        } catch (error) {
          setRestaurants([])
        }
      } else {
        setRestaurants([])
      }
    }

    loadFromStorage()
    window.addEventListener('storage', loadFromStorage)
    return () => window.removeEventListener('storage', loadFromStorage)
  }, [])

  const handleCreateRestaurant = () => {
    navigate('/onboarding')
  }

  const handleManageRestaurant = (restaurant) => {
    if (!restaurant) return
    dispatch(setRestaurant(restaurant))
    navigate('/dashboard')
  }

  const hasRestaurants = restaurants.length > 0

  return (
    <section className="partner-hub">
      <header className="partner-hero">
        <div className="partner-hero__content">
          <p className="partner-hero__eyebrow">FoodFast Partner Center</p>
          <h1>
            Xin chào{account?.fullName ? `, ${account.fullName}` : ''}
            <span>! Bắt đầu quản lý nhà hàng của bạn.</span>
          </h1>
          <p className="partner-hero__subtitle">
            Tạo nhà hàng mới hoặc chọn cửa hàng đã đăng ký để truy cập Dashboard và công cụ quản lý đơn hàng.
          </p>
          <div className="partner-hero__actions">
            <button type="button" className="hub-primary" onClick={handleCreateRestaurant}>
              🚀 Đăng ký nhà hàng mới
            </button>
            <button
              type="button"
              className="hub-secondary"
              onClick={() => (hasRestaurants ? navigate('/dashboard') : handleCreateRestaurant())}
            >
              {hasRestaurants ? '📊 Vào Dashboard' : '📄 Xem hướng dẫn đăng ký'}
            </button>
          </div>
        </div>
        <div className="partner-hero__visual" aria-hidden="true">
          <div className="partner-hero__card">
            <div className="partner-hero__card-header">
              <span>🚁</span>
              <strong>FoodFast Drone Hub</strong>
            </div>
            <p className="partner-hero__card-body">Theo dõi tiến trình onboard và quản lý mọi chi nhánh trong một nơi.</p>
          </div>
        </div>
      </header>

      <section className="hub-grid">
        <article className="hub-panel hub-panel--create">
          <div>
            <h2>Đăng ký nhà hàng mới</h2>
            <p>
              Chuẩn bị thông tin cơ bản, giấy phép và khu vực drone pad. Hoàn tất biểu mẫu để đội ngũ FoodFast kích hoạt
              trong 24 giờ.
            </p>
          </div>
          <button type="button" onClick={handleCreateRestaurant} className="hub-primary">
            Bắt đầu đăng ký
          </button>
        </article>

        <article className="hub-panel">
          <div className="hub-panel__header">
            <h2>Nhà hàng đã đăng ký</h2>
            <span className="hub-count">{restaurants.length}</span>
          </div>
          {hasRestaurants ? (
            <ul className="hub-list">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id} className="hub-list__item">
                  <div>
                    <strong>{restaurant.name}</strong>
                    <p>{restaurant.address || 'Chưa cập nhật địa chỉ'}</p>
                    <span className="hub-meta">
                      {restaurant.district ? `Khu vực: ${restaurant.district}` : 'Khu vực đang cập nhật'}
                    </span>
                  </div>
                  <button type="button" onClick={() => handleManageRestaurant(restaurant)} className="hub-secondary">
                    Quản lý nhà hàng
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="hub-empty">
              <p>Chưa có nhà hàng nào được đăng ký. Bắt đầu với biểu mẫu bên cạnh để tạo hồ sơ đầu tiên.</p>
              <button type="button" onClick={handleCreateRestaurant} className="hub-primary">
                Đăng ký ngay
              </button>
            </div>
          )}
        </article>
      </section>
    </section>
  )
}

export default PartnerHub
