import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login as loginAction } from '../../store/slices/authSlice'
import './Login.css'

const initialLoginForm = {
  email: '',
  password: '',
}

const initialSignupForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function Login() {
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [signupForm, setSignupForm] = useState(initialSignupForm)
  const [showSignup, setShowSignup] = useState(false)
  const [showSmsLogin, setShowSmsLogin] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [smsStep, setSmsStep] = useState('phone') // 'phone' or 'code'
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const storageKey = 'foodfastPartnerAccount'

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (event) => {
    const { name, value } = event.target
    setSignupForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleSignup = () => {
    setShowSignup((prev) => !prev)
    setShowSmsLogin(false)
    setLoginError('')
    setSignupError('')
  }

  const handleSmsLogin = () => {
    setShowSmsLogin(true)
    setShowSignup(false)
    setSmsStep('phone')
    setSmsPhone('')
    setSmsCode('')
    setLoginError('')
  }

  const handleSmsPhoneSubmit = (e) => {
    e.preventDefault()
    if (smsPhone.length === 10) {
      setSmsStep('code')
      setLoginError('')
    } else {
      setLoginError('Vui lòng nhập đúng số điện thoại')
    }
  }

  const handleSmsCodeSubmit = (e) => {
    e.preventDefault()
    
    let account
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        try {
          account = JSON.parse(stored)
        } catch (error) {
          account = null
        }
      }
    }

    if (!account) {
      setLoginError('Tài khoản không tồn tại')
      return
    }

    // Mock SMS verification - in real app would verify with backend
    if (smsCode === '123456') {
      let restaurants = []
      let lastRestaurantId = null
      if (typeof window !== 'undefined') {
        const storedRestaurants = window.localStorage.getItem('foodfastRegisteredRestaurants')
        lastRestaurantId = window.localStorage.getItem('foodfastLastRestaurantId')
        if (storedRestaurants) {
          try {
            restaurants = JSON.parse(storedRestaurants) || []
          } catch (error) {
            restaurants = []
          }
        }
      }

      const selectedRestaurant =
        restaurants.find(restaurant => restaurant.id === lastRestaurantId) || restaurants[0] || null

      dispatch(
        loginAction({
          user: { name: account.fullName || 'FoodFast Partner', email: account.email },
          restaurant: selectedRestaurant,
          token: 'mock-restaurant-token',
        }),
      )

      navigate('/restaurant-hub')
    } else {
      setLoginError('Mã xác thực không chính xác')
    }
  }

  const handleLogin = (event) => {
    event.preventDefault()
    setLoginError('')

    let account
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        try {
          account = JSON.parse(stored)
        } catch (error) {
          account = null
        }
      }
    }

    if (!account || !account.email) {
      setLoginError('Vui lòng tạo tài khoản trước khi đăng nhập.')
      return
    }

    if (account.email !== loginForm.email || account.password !== loginForm.password) {
      setLoginError('Thông tin đăng nhập chưa chính xác.')
      return
    }

    let restaurants = []
    let lastRestaurantId = null
    if (typeof window !== 'undefined') {
      const storedRestaurants = window.localStorage.getItem('foodfastRegisteredRestaurants')
      lastRestaurantId = window.localStorage.getItem('foodfastLastRestaurantId')
      if (storedRestaurants) {
        try {
          restaurants = JSON.parse(storedRestaurants) || []
        } catch (error) {
          restaurants = []
        }
      }
    }

    const selectedRestaurant =
      restaurants.find(restaurant => restaurant.id === lastRestaurantId) || restaurants[0] || null

    dispatch(
      loginAction({
        user: { name: account.fullName || 'FoodFast Partner', email: loginForm.email },
        restaurant: selectedRestaurant,
        token: 'mock-restaurant-token',
      }),
    )

    navigate('/restaurant-hub')
  }

  const handleSignupSubmit = (event) => {
    event.preventDefault()
    setSignupError('')

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Mật khẩu xác nhận chưa trùng khớp.')
      return
    }

    const accountData = {
      fullName: signupForm.fullName,
      email: signupForm.email,
      phone: signupForm.phone,
      password: signupForm.password,
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(accountData))
    }

    setLoginError('')
    setLoginForm({ email: signupForm.email, password: '' })
    setSignupForm(initialSignupForm)
    toggleSignup()
  }

  return (
    <div className="box-login">
      <div className="login-container">
        <section id="formHolder">
          <div className="row">
            <div className={`brand ${showSignup ? 'active' : ''}`}>
              <a href="/" className="logo">
                FF <span>🚁</span>
              </a>
              <div className={`heading ${showSignup ? 'active' : ''}`}>
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
              <div className={`login form-piece ${showSignup || showSmsLogin ? 'switched' : ''}`}>
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
                    <button type="button" className="link-button sms-login-btn" onClick={handleSmsLogin}>
                      Hoặc đăng nhập bằng SMS
                    </button>
                  </div>
                  {loginError ? <p className="form-error">{loginError}</p> : null}
                  <div className="CTA">
                    <input type="submit" value="Đăng nhập" />
                    <button type="button" className="switch link-button" onClick={toggleSignup}>
                      Chưa có tài khoản?
                    </button>
                  </div>
                </form>
              </div>

              <div className={`sms-login form-piece ${showSmsLogin ? 'active' : ''}`}>
                {smsStep === 'phone' ? (
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
                    {loginError ? <p className="form-error">{loginError}</p> : null}
                    <div className="CTA">
                      <input type="submit" value="Nhận mã xác thực" />
                      <button type="button" className="switch link-button" onClick={() => setShowSmsLogin(false)}>
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
                    {loginError ? <p className="form-error">{loginError}</p> : null}
                    <div className="CTA">
                      <input type="submit" value="Xác nhận" />
                      <button type="button" className="switch link-button" onClick={() => setSmsStep('phone')}>
                        Gửi lại mã
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className={`signup form-piece ${showSignup ? 'active' : ''}`}>
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
                  {signupError ? <p className="form-error">{signupError}</p> : null}
                  <div className="CTA">
                    <input type="submit" value="Tạo tài khoản" id="submit" />
                    <button type="button" className="switch link-button" onClick={toggleSignup}>
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
  )
}

export default Login
