import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import './Layout.css'

function Layout() {
  const { user } = useSelector(state => state.auth)
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
          <h2>⚙️ FoodFast Admin</h2>
          <p className="admin-name">{user?.name}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            📊 Dashboard
          </Link>
          <Link to="/users" className="nav-item">
            👥 Quản lý người dùng
          </Link>
          <Link to="/restaurants" className="nav-item">
            🏪 Quản lý nhà hàng
          </Link>
          <Link to="/orders" className="nav-item">
            📦 Giám sát đơn hàng
          </Link>
          <Link to="/drones" className="nav-item">
            🚁 Quản lý Drone
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
