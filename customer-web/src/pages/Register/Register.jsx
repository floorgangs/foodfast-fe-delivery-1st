import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../../store/slices/authSlice";
import socketService from "../../services/socket";
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
        registerUser({
          name,
          email,
          phone,
          password,
          role: "customer",
        })
      ).unwrap();

      // Kết nối Socket.io sau khi đăng ký thành công
      socketService.connect({
        id: result.user.id,
        role: result.user.role,
      });

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
        <div className="register-top">
          <img src="/logo192.png" alt="logo" className="register-logo" />
          <h2>Đăng ký</h2>
          <p>Tạo tài khoản mới để bắt đầu</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
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
  );
}

export default Register;
