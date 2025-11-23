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
        <div className="login-header">
          <h1>🚁 FoodFast</h1>
          <p>Giao hàng bằng Drone - Nhanh như chớp</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập</h2>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer1@gmail.com"
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
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="login-footer">
            <p>
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
            <p className="demo-note">
              📝 Tài khoản demo: customer1@gmail.com / 123456
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
