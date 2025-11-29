import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/slices/authSlice";
import { fetchCart } from "../../store/slices/cartSlice";
import { initSocket, joinCustomerRoom } from "../../services/socket";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        login({
          email,
          password,
        })
      ).unwrap();

      // Initialize socket and join customer room
      initSocket();
      joinCustomerRoom(result.data.id || result.data._id);

      // Fetch cart from server
      try {
        await dispatch(fetchCart()).unwrap();
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }

      // Redirect về trang trước đó (nếu có) hoặc về home
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Banner */}
        <div className="login-banner">
          <div className="banner-content">
            <div className="banner-icon">🚁</div>
            <h2>FoodFast Delivery</h2>
            <p>Trải nghiệm giao hàng bằng Drone siêu tốc. Đặt món yêu thích và nhận hàng trong vài phút!</p>
            <ul className="banner-features">
              <li><span>⚡</span> Giao hàng nhanh chóng</li>
              <li><span>🎯</span> Định vị chính xác</li>
              <li><span>💳</span> Thanh toán đa dạng</li>
              <li><span>🔒</span> An toàn & bảo mật</li>
            </ul>
          </div>
        </div>

        {/* Right Form */}
        <div className="login-form-section">
          <div className="login-header">
            <div className="logo-text">🚁 FoodFast</div>
            <h1>Chào mừng trở lại!</h1>
            <p>Đăng nhập để tiếp tục đặt món</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="login-footer">
              <p>
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
              </p>
              <div className="demo-note">
                <strong>📝 Tài khoản demo:</strong>
                customer1@gmail.com / 123456
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
