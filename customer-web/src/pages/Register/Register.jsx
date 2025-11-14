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
          <div className="form-group input-with-icon">
            <label>Họ và tên</label>
            <span className="icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              required
            />
          </div>

          <div className="form-group input-with-icon">
            <label>Email</label>
            <span className="icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
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

          <div className="form-group input-with-icon">
            <label>Số điện thoại</label>
            <span className="icon phone-icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
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

          <div className="form-group input-with-icon">
            <label>Mật khẩu</label>
            <span className="icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
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

          <div className="form-group input-with-icon">
            <label>Xác nhận mật khẩu</label>
            <span className="icon" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
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
