import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import "./Login.css";

function Login() {
  const [phone, setPhone] = useState("");
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

    // Mock login - trong thực tế sẽ gọi API
    const mockUser = {
      id: "1",
      name: "Nguyễn Văn A",
      email: "user@foodfast.vn",
      phone: phone,
      address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    };

    dispatch(
      login({
        user: mockUser,
        token: "mock-token-" + Date.now(),
      })
    );

    navigate("/");
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
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
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

          <div className="login-footer">
            <p>
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
            <p className="demo-note">
              Demo: Nhập số điện thoại/password bất kỳ để đăng nhập
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
