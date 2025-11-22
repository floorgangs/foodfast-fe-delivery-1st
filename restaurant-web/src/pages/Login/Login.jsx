import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as loginAction } from "../../store/slices/authSlice";
import { authAPI, restaurantAPI } from "../../services/api";
import "./Login.css";

const initialLoginForm = { email: "", password: "" };
const initialSignupForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  if (error.details) return error.details;
  return fallback;
};

function Login() {
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [showSignup, setShowSignup] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSignup = () => {
    setShowSignup((prev) => !prev);
    setLoginError("");
    setSignupError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await authAPI.login(loginForm.email, loginForm.password);
      if (!response?.success) {
        throw new Error(response?.message || "Đăng nhập thất bại");
      }

      const { user, token } = response.data;

      let restaurant = null;
      try {
        const restaurantResponse = await restaurantAPI.getMyRestaurant();
        if (restaurantResponse?.success) {
          restaurant = restaurantResponse.data;
        }
      } catch (restaurantError) {
        const message = getErrorMessage(restaurantError, "");
        if (message && message !== "Bạn chưa có nhà hàng") {
          console.log("Không thể tải nhà hàng của bạn:", message);
        }
      }

      dispatch(
        loginAction({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          restaurant,
          token,
        })
      );

      // Sau khi đăng nhập, chuyển đến trang chọn nhà hàng
      navigate("/select-restaurant");
    } catch (error) {
      setLoginError(
        getErrorMessage(
          error,
          "Email hoặc mật khẩu không đúng. Vui lòng thử lại."
        )
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Mật khẩu xác nhận chưa trùng khớp.");
      return;
    }

    setSignupLoading(true);

    try {
      const registerResponse = await authAPI.register({
        name: signupForm.fullName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        role: "restaurant",
      });

      if (!registerResponse?.success) {
        throw new Error(registerResponse?.message || "Đăng ký thất bại");
      }

      const { user, token } = registerResponse.data;

      dispatch(
        loginAction({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          restaurant: null,
          token,
        })
      );

      setSignupForm(initialSignupForm);
      navigate("/onboarding");
    } catch (error) {
      setSignupError(
        getErrorMessage(
          error,
          "Không thể đăng ký tài khoản. Vui lòng thử lại."
        )
      );
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="box-login">
      <div className="login-container">
        <section id="formHolder">
          <div className="row">
            <div className={`brand ${showSignup ? "active" : ""}`}>
              <a href="/" className="logo">
                FF <span>🚁</span>
              </a>
              <div className={`heading ${showSignup ? "active" : ""}`}>
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
              <div className={`login form-piece ${showSignup ? "switched" : ""}`}>
                <form className="login-form" onSubmit={handleLogin}>
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
                    />
                    <label htmlFor="loginPassword">Mật khẩu</label>
                  </div>
                  {loginError ? (
                    <p className="form-error">{loginError}</p>
                  ) : null}
                  <div className="CTA">
                    <input
                      type="submit"
                      value={loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                      disabled={loginLoading}
                    />
                    <button
                      type="button"
                      className="switch link-button"
                      onClick={toggleSignup}
                    >
                      Chưa có tài khoản?
                    </button>
                  </div>
                </form>
              </div>

              <div className={`signup form-piece ${showSignup ? "active" : ""}`}>
                <form className="signup-form" onSubmit={handleSignupSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="fullName"
                      onChange={handleSignupChange}
                      id="fullName"
                      value={signupForm.fullName}
                      placeholder=" "
                      autoComplete="name"
                      required
                    />
                    <label htmlFor="fullName">Họ và tên</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      onChange={handleSignupChange}
                      id="signupEmail"
                      className="email"
                      value={signupForm.email}
                      placeholder=" "
                      autoComplete="email"
                      required
                    />
                    <label htmlFor="signupEmail">Địa chỉ email</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      onChange={handleSignupChange}
                      id="phone"
                      value={signupForm.phone}
                      placeholder=" "
                      autoComplete="tel"
                      required
                    />
                    <label htmlFor="phone">Số điện thoại</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      name="password"
                      onChange={handleSignupChange}
                      id="password"
                      className="pass"
                      value={signupForm.password}
                      placeholder=" "
                      autoComplete="new-password"
                      required
                    />
                    <label htmlFor="password">Mật khẩu</label>
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      onChange={handleSignupChange}
                      id="passwordCon"
                      className="passConfirm"
                      value={signupForm.confirmPassword}
                      placeholder=" "
                      autoComplete="new-password"
                      required
                    />
                    <label htmlFor="passwordCon">Xác nhận mật khẩu</label>
                  </div>
                  {signupError ? (
                    <p className="form-error">{signupError}</p>
                  ) : null}
                  <div className="CTA">
                    <input
                      type="submit"
                      value={signupLoading ? "Đang tạo..." : "Tạo tài khoản"}
                      id="submit"
                      disabled={signupLoading}
                    />
                    <button
                      type="button"
                      className="switch link-button"
                      onClick={toggleSignup}
                    >
                      Tôi có tài khoản
                    </button>
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
