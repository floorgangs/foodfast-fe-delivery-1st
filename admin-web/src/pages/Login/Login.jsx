import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      login({
        user: { name: "Admin User", email, role: "admin" },
        token: "mock-admin-token-" + Date.now(),
      })
    );

    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>⚙️ FoodFast Admin</h1>
          <p>Hệ thống quản trị</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập Admin</h2>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@foodfast.com"
              required
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
            />
          </div>

          <button type="submit" className="login-btn">
            Đăng nhập
          </button>

          <p className="demo-note">
            Demo: Nhập email/password bất kỳ để đăng nhập
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
