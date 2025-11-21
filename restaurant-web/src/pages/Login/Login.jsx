import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/slices/authSlice";
import {
  initDemoData,
  demoAccounts,
  demoRestaurants,
} from "../../data/demoAccounts";
import { initDemoRestaurantData } from "../../data/demoData";
import "./Login.css";

const initialLoginForm = {
  email: "",
  password: "",
};

const initialSignupForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function Login() {
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);
  const [showSignup, setShowSignup] = useState(false);
  const [showSmsLogin, setShowSmsLogin] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsStep, setSmsStep] = useState("phone"); // 'phone' or 'code'
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storageKey = "foodfastPartnerAccount";

  // Khởi tạo dữ liệu demo khi component mount
  useEffect(() => {
    initDemoData();
    initDemoRestaurantData(); // Load menu, promotions, orders
  }, []);

  const handleUseDemoAccount = (email, password) => {
    setLoginForm({ email, password });
    setShowDemoAccounts(false);
  };

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
    setShowSmsLogin(false);
    setLoginError("");
    setSignupError("");
  };

  const handleSmsLogin = () => {
    setShowSmsLogin(true);
    setShowSignup(false);
    setSmsStep("phone");
    setSmsPhone("");
    setSmsCode("");
    setLoginError("");
  };

  const handleSmsPhoneSubmit = (e) => {
    e.preventDefault();
    if (smsPhone.length === 10) {
      setSmsStep("code");
      setLoginError("");
    } else {
      setLoginError("Vui lòng nhập đúng số điện thoại");
    }
  };

  const handleSmsCodeSubmit = (e) => {
    e.preventDefault();

    let account;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          account = JSON.parse(stored);
        } catch (error) {
          account = null;
        }
      }
    }

    if (!account) {
      setLoginError("Tài khoản không tồn tại");
      return;
    }

    // Mock SMS verification - in real app would verify with backend
    if (smsCode === "123456") {
      let restaurants = [];
      let lastRestaurantId = null;
      if (typeof window !== "undefined") {
        const storedRestaurants = window.localStorage.getItem(
          "foodfastRegisteredRestaurants"
        );
        lastRestaurantId = window.localStorage.getItem(
          "foodfastLastRestaurantId"
        );
        if (storedRestaurants) {
          try {
            restaurants = JSON.parse(storedRestaurants) || [];
          } catch (error) {
            restaurants = [];
          }
        }
      }

      // Tìm nhà hàng của user này
      const myRestaurant =
        restaurants.find(
          (r) => r.ownerId === account.id || r.ownerEmail === account.email
        ) || null;

      if (!myRestaurant) {
        setLoginError("Bạn chưa đăng ký nhà hàng.");
        return;
      }

      dispatch(
        loginAction({
          user: {
            id: account.id,
            name: account.fullName || "FoodFast Partner",
            email: account.email,
          },
          restaurant: myRestaurant,
          token: "mock-restaurant-token",
        })
      );

      navigate("/dashboard");
    } else {
      setLoginError("Mã xác thực không chính xác");
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setLoginError("");

    // Kiểm tra trong danh sách tài khoản demo trước
    let account = demoAccounts.find(
      (acc) =>
        acc.email === loginForm.email && acc.password === loginForm.password
    );

    // Nếu không tìm thấy, kiểm tra trong localStorage
    if (!account && typeof window !== "undefined") {
      const storedAccounts = window.localStorage.getItem(
        "foodfastPartnerAccounts"
      );
      if (storedAccounts) {
        try {
          const accounts = JSON.parse(storedAccounts);
          account = accounts.find(
            (acc) =>
              acc.email === loginForm.email &&
              acc.password === loginForm.password
          );
        } catch (error) {
          // Ignore parse error
        }
      }
    }

    if (!account) {
      setLoginError("Email hoặc mật khẩu không chính xác.");
      return;
    }

    // Tìm nhà hàng của tài khoản này
    let restaurants = [...demoRestaurants];
    if (typeof window !== "undefined") {
      const storedRestaurants = window.localStorage.getItem(
        "foodfastRegisteredRestaurants"
      );
      if (storedRestaurants) {
        try {
          const customRestaurants = JSON.parse(storedRestaurants) || [];
          restaurants = [...demoRestaurants, ...customRestaurants];
        } catch (error) {
          // Ignore parse error
        }
      }
    }

    // Tìm nhà hàng của user này (1 owner chỉ có 1 nhà hàng)
    const myRestaurant =
      restaurants.find(
        (r) => r.ownerId === account.id || r.ownerEmail === account.email
      ) || null;

    if (!myRestaurant) {
      setLoginError(
        "Bạn chưa đăng ký nhà hàng. Vui lòng liên hệ admin để được hỗ trợ."
      );
      return;
    }

    if (!myRestaurant.approved) {
      setLoginError(
        "Nhà hàng của bạn chưa được admin phê duyệt. Vui lòng đợi thêm."
      );
      return;
    }

    dispatch(
      loginAction({
        user: {
          id: account.id,
          name: account.fullName || "FoodFast Partner",
          email: loginForm.email,
        },
        restaurant: myRestaurant,
        token: "mock-restaurant-token",
      })
    );

    // Vào thẳng dashboard nhà hàng
    navigate("/dashboard");
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    setSignupError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Mật khẩu xác nhận chưa trùng khớp.");
      return;
    }

    const accountId = `partner-${Date.now()}`;
    const accountData = {
      id: accountId,
      fullName: signupForm.fullName,
      email: signupForm.email,
      phone: signupForm.phone,
      password: signupForm.password,
      createdAt: new Date().toISOString(),
    };

    // Tạo nhà hàng mặc định cho partner này
    const newRestaurant = {
      id: `restaurant-${Date.now()}`,
      ownerId: accountId,
      ownerEmail: signupForm.email,
      ownerName: signupForm.fullName,
      name: `Nhà hàng của ${signupForm.fullName}`, // Có thể để partner đổi sau
      phone: signupForm.phone,
      email: signupForm.email,
      location: "Chưa cập nhật",
      cuisine: "Chưa cập nhật",
      taxCode: "",
      taxRate: "4.5",
      approved: false, // Cần admin duyệt
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(accountData));

      // Lưu nhà hàng vào danh sách
      const existingRestaurants = JSON.parse(
        window.localStorage.getItem("foodfastRegisteredRestaurants") || "[]"
      );
      existingRestaurants.push(newRestaurant);
      window.localStorage.setItem(
        "foodfastRegisteredRestaurants",
        JSON.stringify(existingRestaurants)
      );
    }

    alert("Đăng ký thành công! Nhà hàng của bạn đang chờ admin phê duyệt.");
    setLoginError("");
    setLoginForm({ email: signupForm.email, password: "" });
    setSignupForm(initialSignupForm);
    toggleSignup();
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
              <div
                className={`login form-piece ${
                  showSignup || showSmsLogin ? "switched" : ""
                }`}
              >
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
                  <div className="form-links">
                    <button type="button" className="link-button">
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="login-options">
                    <button
                      type="button"
                      className="link-button sms-login-btn"
                      onClick={handleSmsLogin}
                    >
                      Hoặc đăng nhập bằng SMS
                    </button>
                  </div>
                  {loginError ? (
                    <p className="form-error">{loginError}</p>
                  ) : null}
                  <div className="CTA">
                    <input type="submit" value="Đăng nhập" />
                    <button
                      type="button"
                      className="switch link-button"
                      onClick={toggleSignup}
                    >
                      Chưa có tài khoản?
                    </button>
                  </div>

                  {/* Tài khoản demo */}
                  <div className="demo-accounts-section">
                    <button
                      type="button"
                      className="demo-toggle-btn"
                      onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    >
                      <span>🔑 Tài khoản demo</span>
                      <span
                        className={`arrow ${showDemoAccounts ? "up" : "down"}`}
                      >
                        ▼
                      </span>
                    </button>

                    {showDemoAccounts && (
                      <div className="demo-accounts-list">
                        {demoAccounts.map((account) => {
                          const restaurant = demoRestaurants.find(
                            (r) => r.ownerId === account.id
                          );
                          return (
                            <button
                              key={account.id}
                              type="button"
                              className="demo-account-item"
                              onClick={() =>
                                handleUseDemoAccount(
                                  account.email,
                                  account.password
                                )
                              }
                            >
                              <div className="demo-account-info">
                                <strong>
                                  {restaurant?.name || account.fullName}
                                </strong>
                                <small>{account.email}</small>
                              </div>
                              <span className="demo-use-btn">→</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div
                className={`sms-login form-piece ${
                  showSmsLogin ? "active" : ""
                }`}
              >
                {smsStep === "phone" ? (
                  <form className="sms-form" onSubmit={handleSmsPhoneSubmit}>
                    <div className="form-group">
                      <input
                        type="tel"
                        id="smsPhone"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder=" "
                        required
                        maxLength="10"
                      />
                      <label htmlFor="smsPhone">Số điện thoại</label>
                    </div>
                    {loginError ? (
                      <p className="form-error">{loginError}</p>
                    ) : null}
                    <div className="CTA">
                      <input type="submit" value="Nhận mã xác thực" />
                      <button
                        type="button"
                        className="switch link-button"
                        onClick={() => setShowSmsLogin(false)}
                      >
                        Quay lại đăng nhập
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="sms-form" onSubmit={handleSmsCodeSubmit}>
                    <div className="form-group">
                      <input
                        type="text"
                        id="smsCode"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        placeholder=" "
                        required
                        maxLength="6"
                      />
                      <label htmlFor="smsCode">Mã xác thực (123456)</label>
                    </div>
                    {loginError ? (
                      <p className="form-error">{loginError}</p>
                    ) : null}
                    <div className="CTA">
                      <input type="submit" value="Xác nhận" />
                      <button
                        type="button"
                        className="switch link-button"
                        onClick={() => setSmsStep("phone")}
                      >
                        Gửi lại mã
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div
                className={`signup form-piece ${showSignup ? "active" : ""}`}
              >
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
                    <input type="submit" value="Tạo tài khoản" id="submit" />
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
