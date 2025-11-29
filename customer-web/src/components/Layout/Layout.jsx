import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { logout } from "../../store/slices/authSlice";
import { getAllOrders } from "../../services/orderService";
import ActiveOrderBanner from "../ActiveOrderBanner/ActiveOrderBanner";
import "./Layout.css";

function Layout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const checkActiveOrders = () => {
      const orders = getAllOrders();
      const hasActive = orders.some(
        (order) => order.status !== "completed" && order.status !== "cancelled"
      );
      setHasActiveOrder(hasActive);
    };

    checkActiveOrders();

    // Check periodically
    const interval = setInterval(checkActiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className={`layout ${hasActiveOrder ? "has-active-banner" : ""}`}>
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            FoodFast
          </Link>
          <nav className="nav">
            <Link to="/">
              <span>Trang chủ</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/notifications">
                  <span>Thông báo</span>
                </Link>
                <Link to="/vouchers">
                  <span>Voucher</span>
                </Link>
              </>
            )}
            <Link to="/cart" className="cart-link">
              <span>Giỏ hàng</span>
              {items.length > 0 && <span className="cart-badge">{items.length}</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders">
                  <span>Đơn hàng</span>
                </Link>
                <Link to="/profile">
                  <span>{user?.name || "Tài khoản"}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="auth-link">
                  <span>Đăng ký</span>
                </Link>
                <Link to="/login" className="auth-link login-link">
                  <span>Đăng nhập</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <ActiveOrderBanner />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 FoodFast - Giao hàng bằng Drone</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
