import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
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
  const [checkingEmail, setCheckingEmail] = useState(false);
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

    // validate email and phone before submit
    const emailValid = validateEmail(email);
    const phoneValid = validatePhone(phone);
    setEmailError(emailValid ? "" : "Email không hợp lệ");
    setPhoneError(phoneValid ? "" : "Số điện thoại không hợp lệ");
    // password length
    const pwdOk = password && password.length >= 8;
    setPasswordError(pwdOk ? "" : "Mật khẩu phải có ít nhất 8 ký tự");
    const confirmOk = password === confirm;
    setConfirmError(confirmOk ? "" : "Mật khẩu xác nhận không khớp");

    if (!emailValid || !phoneValid || !pwdOk || !confirmOk) return;
    if (emailError) return; // if email already marked as existing

    const mockUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      address: "",
    };

    dispatch(login({ user: mockUser, token: "mock-token-" + Date.now() }));
    navigate("/");
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

  // mock API: treat emails ending with @taken.com as already used
  function mockCheckEmailExists(value) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowered = (value || "").toLowerCase();
        if (!lowered) return resolve(false);
        // sample rule: if email endsWith "@taken.com" or is "used@example.com" -> exists
        if (lowered.endsWith("@taken.com") || lowered === "used@example.com")
          return resolve(true);
        return resolve(false);
      }, 650);
    });
  }

  async function handleEmailBlur() {
    // quick client-side format check first
    if (!email) return;
    if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }
    setCheckingEmail(true);
    const exists = await mockCheckEmailExists(email);
    setCheckingEmail(false);
    if (exists) setEmailError("Email này đã được sử dụng");
    else setEmailError("");
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
              onBlur={handleEmailBlur}
              placeholder="example@email.com"
              required
            />
            {checkingEmail && (
              <div className="input-note">Đang kiểm tra email...</div>
            )}
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
