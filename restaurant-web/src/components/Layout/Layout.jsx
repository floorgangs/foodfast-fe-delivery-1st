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
          <h2>🏪 FoodFast</h2>
          <p className="restaurant-name">{restaurant?.name}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            📊 Dashboard
          </Link>
          <Link to="/menu" className="nav-item">
            📋 Quản lý thực đơn
          </Link>
          <Link to="/orders" className="nav-item">
            🛍️ Quản lý đơn hàng
          </Link>
          <Link to="/statistics" className="nav-item">
            📈 Thống kê
          </Link>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          Đăng xuất
        </button>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
