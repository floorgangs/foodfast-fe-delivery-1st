import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import "./Layout.css";

function Layout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-logo">👑</span>
            <span className="brand-text">FoodFast Admin</span>
          </div>
          <div className="admin-info">
            <p className="admin-name">{user?.name || "Admin"}</p>
            <span className="admin-role">Quản trị viên hệ thống</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">▣</span>
            <span className="nav-text">Tổng quan</span>
          </Link>

          <div className="nav-group">
            <div className="nav-group-title">Quản lý hệ thống</div>
            <Link to="/restaurants" className="nav-item">
              <span className="nav-icon">🏪</span>
              <span className="nav-text">Nhà hàng</span>
            </Link>
            <Link to="/staff" className="nav-item">
              <span className="nav-icon">👨‍💼</span>
              <span className="nav-text">Nhân viên</span>
            </Link>
            <Link to="/users" className="nav-item">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Người dùng</span>
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">Báo cáo & Phân tích</div>
            <Link to="/statistics" className="nav-item">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Thống kê</span>
            </Link>
            <Link to="/reports" className="nav-item">
              <span className="nav-icon">📄</span>
              <span className="nav-text">Báo cáo</span>
            </Link>
            <Link to="/settings" className="nav-item">
              <span className="nav-icon">⚙</span>
              <span className="nav-text">Cài đặt</span>
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
  );
}

export default Layout;
