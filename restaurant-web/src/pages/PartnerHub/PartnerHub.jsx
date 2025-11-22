import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRestaurant } from '../../store/slices/authSlice'
import { restaurantAPI } from '../../services/api'
import './PartnerHub.css'

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (error.message) return error.message
  if (error.error) return error.error
  return fallback
}

function PartnerHub() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authState = useSelector((state) => state.auth)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyRestaurant = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await restaurantAPI.getMyRestaurant()
        if (response?.success && response.data) {
          setRestaurants([response.data])
          dispatch(setRestaurant(response.data))
        } else {
          setRestaurants([])
        }
      } catch (apiError) {
        const message = getErrorMessage(apiError, '')
        if (message === 'Bạn chưa có nhà hàng') {
          setRestaurants([])
        } else if (message) {
          setError(message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMyRestaurant()
  }, [dispatch])

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
            Xin chào{authState?.user?.name ? `, ${authState.user.name}` : ''}
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

          {loading ? (
            <div className="hub-empty">
              <p>Đang tải dữ liệu nhà hàng...</p>
            </div>
          ) : error ? (
            <div className="hub-empty">
              <p>{error}</p>
              <button type="button" onClick={handleCreateRestaurant} className="hub-secondary">
                Đăng ký mới
              </button>
            </div>
          ) : hasRestaurants ? (
            <ul className="hub-list">
              {restaurants.map((restaurant) => (
                <li key={restaurant._id} className="hub-list__item">
                  <div>
                    <strong>{restaurant.name}</strong>
                    <p>
                      {restaurant.address?.street || 'Chưa cập nhật địa chỉ'}
                      {restaurant.address?.district ? `, ${restaurant.address.district}` : ''}
                    </p>
                    <span className="hub-meta">
                      {restaurant.isApproved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
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
