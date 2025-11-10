import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import './Layout.css'

function Layout() {
  const { user } = useSelector(state => state.auth)
  const { items } = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            🚁 FoodFast
          </Link>
          <nav className="nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/cart" className="cart-link">
              🛒 Giỏ hàng ({items.length})
            </Link>
            <Link to="/profile">👤 {user?.name || 'Tài khoản'}</Link>
            <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 FoodFast - Giao hàng bằng Drone</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
