import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/slices/authSlice";
import { restaurantAuthAPI } from "../../services/api";
import "./Login.css";

const initialLoginForm = {
  email: "",
  password: "",
};

function Login() {
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await restaurantAuthAPI.login(
        loginForm.email,
        loginForm.password
      );

      console.log("🔍 Login response:", response);
      console.log("🔍 Response data:", response.data);

      if (response.success) {
        const { user, restaurant, token } = response.data;

        console.log("🔍 User data:", user);
        console.log("🔍 Restaurant data:", restaurant);
        console.log("🔍 Token:", token);

        // Dispatch to Redux
        dispatch(
          loginAction({
            user: user,
            restaurant: null, // Không set restaurant ngay, để user chọn ở trang select-restaurant
            token: token,
          })
        );

        // Navigate to select restaurant page (không phải dashboard)
        navigate("/select-restaurant");
      } else {
        setLoginError(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error.response?.data?.message || "Email hoặc mật khẩu không đúng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-login">
      <div className="login-container">
        <section id="formHolder">
          <div className="row">
            <div className="brand">
              <a href="/" className="logo">
                FF <span>🚁</span>
              </a>
              <div className="heading">
                <h2>FoodFast</h2>
                <p>Đối tác giao hàng drone</p>
                <ul className="brand-list">
                  <li>⚡ 15 phút nhận đơn</li>
                  <li>🚁 Theo dõi drone realtime</li>
                  <li>📦 Đồng bộ menu đa nền tảng</li>
                </ul>
              </div>
            </div>

            <div className="form">
              <div className="login form-piece">
                <form className="login-form" onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <input
                      name="email"
                      onChange={handleLoginChange}
                      type="email"
                      id="loginemail"
                      value={loginForm.email}
                      placeholder=" "
                      autoComplete="username"
                      required
                      disabled={loading}
                    />
                    <label htmlFor="loginemail">Địa chỉ email</label>
                  </div>
                  <div className="form-group">
                    <input
                      name="password"
                      onChange={handleLoginChange}
                      type="password"
                      id="loginPassword"
                      value={loginForm.password}
                      placeholder=" "
                      autoComplete="current-password"
                      required
                      disabled={loading}
                    />
                    <label htmlFor="loginPassword">Mật khẩu</label>
                  </div>
                  {loginError && <p className="form-error">{loginError}</p>}
                  <div className="CTA">
                    <input
                      type="submit"
                      value={loading ? "Đang đăng nhập..." : "Đăng nhập"}
                      disabled={loading}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
