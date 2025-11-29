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
            <span className="brand-logo material-icons">admin_panel_settings</span>
            <span className="brand-text">FoodFast Admin</span>
          </div>
          <div className="admin-info">
            <p className="admin-name">{user?.name || "Admin"}</p>
            <span className="admin-role">Quản trị viên hệ thống</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon material-icons">dashboard</span>
            <span className="nav-text">Tổng quan</span>
          </Link>

          <div className="nav-group">
            <div className="nav-group-title">QUẢN LÝ HỆ THỐNG</div>
            <Link to="/restaurants" className="nav-item">
              <span className="nav-icon material-icons">store</span>
              <span className="nav-text">Nhà hàng</span>
            </Link>
            <Link to="/staff" className="nav-item">
              <span className="nav-icon material-icons">badge</span>
              <span className="nav-text">Nhân viên</span>
            </Link>
            <Link to="/users" className="nav-item">
              <span className="nav-icon material-icons">people</span>
              <span className="nav-text">Người dùng</span>
            </Link>
            <Link to="/drones" className="nav-item">
              <span className="nav-icon material-icons">flight</span>
              <span className="nav-text">Drone</span>
            </Link>
            <Link to="/orders" className="nav-item">
              <span className="nav-icon material-icons">receipt_long</span>
              <span className="nav-text">Đơn hàng</span>
            </Link>
            <Link to="/transactions" className="nav-item">
              <span className="nav-icon material-icons">account_balance_wallet</span>
              <span className="nav-text">Giao dịch</span>
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">PHÂN TÍCH</div>
            <Link to="/statistics" className="nav-item">
              <span className="nav-icon material-icons">analytics</span>
              <span className="nav-text">Thống kê</span>
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">CÀI ĐẶT</div>
            <Link to="/settings" className="nav-item">
              <span className="nav-icon material-icons">settings</span>
              <span className="nav-text">Cài đặt tài khoản</span>
            </Link>
          </div>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <span className="material-icons">logout</span>
          Đăng xuất
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
