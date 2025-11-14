import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import "./Layout.css";
import { useState } from "react";

function Layout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="ff-layout">
      {/* Sidebar (left) */}
      <aside className={"ff-sidebar" + (collapsed ? " ff-collapsed" : "")}>
        <div className="ff-sidebar-header">
          <Link to="/" className="ff-brand">
            🍽️ FoodFast Admin
          </Link>
          <p className="ff-admin-name">{user?.name}</p>
        </div>
        <nav className="ff-sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "ff-nav-item" + (isActive ? " active" : "")
            }
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              "ff-nav-item" + (isActive ? " active" : "")
            }
          >
            👥 Quản lý người dùng
          </NavLink>
          <NavLink
            to="/restaurants"
            className={({ isActive }) =>
              "ff-nav-item" + (isActive ? " active" : "")
            }
          >
            🏪 Quản lý nhà hàng
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              "ff-nav-item" + (isActive ? " active" : "")
            }
          >
            📦 Giám sát đơn hàng
          </NavLink>
          <NavLink
            to="/drones"
            className={({ isActive }) =>
              "ff-nav-item" + (isActive ? " active" : "")
            }
          >
            🚁 Quản lý Drone
          </NavLink>
        </nav>
        <div className="ff-sidebar-footer">
          <button onClick={handleLogout} className="ff-logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content area with top navbar (to align with Admin Dashboard look) */}
      <div className="ff-main">
        <header className="ff-topbar">
          <div className="ff-topbar-inner">
            <div className="ff-topbar-left">
              <button
                className="ff-toggle-btn"
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed((s) => !s)}
              >
                ☰
              </button>
              <h4 className="ff-page-title">Admin</h4>
            </div>
            <div className="ff-topbar-right">
              <span className="ff-user">👋 {user?.name || "Quản trị"}</span>
            </div>
          </div>
        </header>

        <main className="ff-content">
          <Outlet />
        </main>

        <footer className="ff-footer">
          <div className="ff-footer-inner">
            © {new Date().getFullYear()} FoodFast
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
