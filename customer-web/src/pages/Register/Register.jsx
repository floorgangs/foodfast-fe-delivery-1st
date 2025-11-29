import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../../store/slices/authSlice";
import { fetchCart } from "../../store/slices/cartSlice";
import { initSocket, joinCustomerRoom } from "../../services/socket";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
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
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const emailValid = validateEmail(email);
    const phoneValid = validatePhone(phone);
    setEmailError(emailValid ? "" : "Email không hợp lệ");
    setPhoneError(phoneValid ? "" : "Số điện thoại không hợp lệ");

    const pwdOk = password && password.length >= 6;
    setPasswordError(pwdOk ? "" : "Mật khẩu phải có ít nhất 6 ký tự");

    const confirmOk = password === confirm;
    setConfirmError(confirmOk ? "" : "Mật khẩu xác nhận không khớp");

    if (!emailValid || !phoneValid || !pwdOk || !confirmOk) return;

    try {
      const result = await dispatch(
        register({
          name,
          email,
          phone,
          password,
          role: "customer",
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

      navigate("/");
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  function validateEmail(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  }

  function validatePhone(value) {
    const v = String(value).trim();
    const re = /^(?:0|\+84)\d{9}$/;
    return re.test(v);
  }

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Left Banner */}
        <div className="register-banner">
          <div className="banner-content">
            <div className="banner-icon">🚁</div>
            <h2>Tham gia FoodFast</h2>
            <p>Đăng ký để trải nghiệm dịch vụ giao hàng bằng Drone nhanh nhất!</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="register-form-section">
          <div className="register-top">
            <div className="logo-text">🚁 FoodFast</div>
            <h2>Tạo tài khoản mới</h2>
            <p>Điền thông tin để bắt đầu</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">⚠️ {error}</div>}
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              className={emailError ? "invalid" : ""}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="example@email.com"
              required
              disabled={loading}
            />
            {emailError && <div className="input-error">{emailError}</div>}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              value={phone}
              className={phoneError ? "invalid" : ""}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError("");
              }}
              onBlur={() => {
                if (phone && !validatePhone(phone))
                  setPhoneError("Số điện thoại không hợp lệ");
              }}
              placeholder="09xxxxxxxx"
              required
              disabled={loading}
            />
            {phoneError && <div className="input-error">{phoneError}</div>}
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              className={passwordError ? "invalid" : ""}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              placeholder="Ít nhất 6 ký tự"
              required
              disabled={loading}
            />
            {passwordError && (
              <div className="input-error">{passwordError}</div>
            )}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirm}
              className={confirmError ? "invalid" : ""}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (confirmError) setConfirmError("");
              }}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            {confirmError && <div className="input-error">{confirmError}</div>}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="agree">
            <input type="checkbox" id="agree" required disabled={loading} />
            <label htmlFor="agree">
              Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
            </label>
          </div>

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <div className="divider">Hoặc</div>

          <p className="have-account">
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
