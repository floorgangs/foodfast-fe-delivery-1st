import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
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

    // validate phone before submit
    const phoneValid = validatePhone(phone);
    setPhoneError(phoneValid ? "" : "Số điện thoại không hợp lệ");
    // password length
    const pwdOk = password && password.length >= 8;
    setPasswordError(pwdOk ? "" : "Mật khẩu phải có ít nhất 8 ký tự");
    const confirmOk = password === confirm;
    setConfirmError(confirmOk ? "" : "Mật khẩu xác nhận không khớp");

    if (!phoneValid || !pwdOk || !confirmOk) return;

    const mockUser = {
      id: Date.now().toString(),
      name,
      email: "user@foodfast.vn",
      phone,
      address: "",
    };

    dispatch(login({ user: mockUser, token: "mock-token-" + Date.now() }));
    navigate("/");
  };

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
            <label>Số điện thoại</label>
            <input
              value={phone}
              className={phoneError ? "invalid" : ""}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError("");
              }}
              onBlur={() => {
                if (!validatePhone(phone))
                  setPhoneError("Số điện thoại không hợp lệ");
              }}
              placeholder="09xxxxxxxx"
              required
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
              placeholder="••••••••"
              required
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
            />
            {confirmError && <div className="input-error">{confirmError}</div>}
          </div>

          <div className="agree">
            <input type="checkbox" id="agree" required />
            <label htmlFor="agree">
              Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
            </label>
          </div>

          <button className="register-btn" type="submit">
            Đăng ký
          </button>

          <div className="divider">Hoặc đăng ký với</div>

          <div className="socials">
            <button type="button" className="btn-google">
              G Đăng ký với Google
            </button>
            <button type="button" className="btn-fb">
              f Đăng ký với Facebook
            </button>
          </div>

          <p className="have-account">
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
