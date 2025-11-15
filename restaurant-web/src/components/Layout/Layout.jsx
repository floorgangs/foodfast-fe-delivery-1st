import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import './Layout.css'

function Layout() {
  const { restaurant } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-logo">✈</span>
            <span className="brand-text">FoodFast Partner</span>
          </div>
          <div className="restaurant-info">
            <p className="restaurant-name">{restaurant?.name || 'Nhà hàng'}</p>
            <button onClick={() => navigate('/restaurant-hub')} className="switch-restaurant">
              ↻ Đổi nhà hàng
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">▣</span>
            <span className="nav-text">Tổng quan</span>
          </Link>
          
          <div className="nav-group">
            <div className="nav-group-title">Quản lý bán hàng</div>
            <Link to="/orders" className="nav-item">
              <span className="nav-icon">▫</span>
              <span className="nav-text">Quản lý đơn hàng</span>
            </Link>
            <Link to="/menu" className="nav-item">
              <span className="nav-icon">☰</span>
              <span className="nav-text">Quản lý thực đơn</span>
            </Link>
            <Link to="/promotions" className="nav-item">
              <span className="nav-icon">%</span>
              <span className="nav-text">Quản lý khuyến mãi</span>
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Vận hành</div>
            <Link to="/reviews" className="nav-item">
              <span className="nav-icon">★</span>
              <span className="nav-text">Đánh giá</span>
            </Link>
            <Link to="/drones" className="nav-item">
              <span className="nav-icon">✈</span>
              <span className="nav-text">Quản lý Drone</span>
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Báo cáo</div>
            <Link to="/statistics" className="nav-item">
              <span className="nav-icon">▤</span>
              <span className="nav-text">Báo cáo & Thống kê</span>
            </Link>
            <Link to="/account-settings" className="nav-item">
              <span className="nav-icon">⚙</span>
              <span className="nav-text">Cài đặt tài khoản</span>
            </Link>
          </div>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Đăng xuất
        </button>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
