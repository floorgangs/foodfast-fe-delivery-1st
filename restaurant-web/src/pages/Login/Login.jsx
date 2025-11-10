import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const mockRestaurant = {
      id: '1',
      name: 'Cơm Tấm Sài Gòn',
      email: email,
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Q.1, TP.HCM'
    }
    
    dispatch(login({
      user: { name: 'Restaurant Manager', email },
      restaurant: mockRestaurant,
      token: 'mock-restaurant-token-' + Date.now()
    }))
    
    navigate('/')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏪 FoodFast Restaurant</h1>
          <p>Hệ thống quản lý nhà hàng</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập</h2>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="restaurant@email.com"
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
          
          <p className="demo-note">Demo: Nhập email/password bất kỳ để đăng nhập</p>
        </form>
      </div>
    </div>
  )
}

export default Login
