import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
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
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowAccountMenu(false);
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
                <Link to="/orders">
                  <span>Đơn hàng</span>
                </Link>
              </>
            )}
            <Link to="/cart" className="cart-link">
              <span>Giỏ hàng</span>
              {items.length > 0 && <span className="cart-badge">{items.length}</span>}
            </Link>
            {isAuthenticated ? (
              <div className="account-dropdown" ref={accountMenuRef}>
                <button 
                  className="account-btn"
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{user?.name || "Tài khoản"}</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="arrow-icon">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                {showAccountMenu && (
                  <div className="account-menu">
                    <Link to="/profile" onClick={() => setShowAccountMenu(false)}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Tài khoản của tôi
                    </Link>
                    <button onClick={handleLogout} className="logout-menu-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
