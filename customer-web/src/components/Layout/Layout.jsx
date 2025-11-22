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
            🚁 FoodFast
          </Link>
          <nav className="nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/cart" className="cart-link">
              🛒 Giỏ hàng ({items.length})
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders">📦 Đơn hàng</Link>
                <Link to="/profile">👤 {user?.name || "Tài khoản"}</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="auth-link">
                  Đăng ký
                </Link>
                <Link to="/login" className="auth-link">
                  Đăng nhập
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
