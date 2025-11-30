import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './AccountSettings.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function AccountSettings() {
  const navigate = useNavigate()
  const [showVerifyModal, setShowVerifyModal] = useState(true)
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState('account') // 'account', 'restaurant', 'payment', 'staff', 'password'
  const [userData, setUserData] = useState(null)
  const [restaurantData, setRestaurantData] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    paypalEmail: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    cuisine: '',
    openTime: '06:00',
    closeTime: '22:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  })

  // Load user and restaurant data after verification
  useEffect(() => {
    if (isVerified) {
      loadUserData()
    }
  }, [isVerified])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('restaurant_token')
      const storedUser = JSON.parse(localStorage.getItem('restaurant_user') || '{}')
      const storedRestaurant = JSON.parse(localStorage.getItem('restaurant_data') || '{}')
      
      console.log('🔍 Loaded restaurant data:', storedRestaurant)
      
      setUserData(storedUser)
      setRestaurantData(storedRestaurant)
      
      setFormData(prev => ({
        ...prev,
        fullName: storedUser.name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        paypalEmail: storedRestaurant.paypalEmail || storedUser.email || '',
        restaurantName: storedRestaurant.name || '',
        restaurantAddress: typeof storedRestaurant.address === 'object' 
          ? `${storedRestaurant.address?.street || ''}, ${storedRestaurant.address?.district || ''}, ${storedRestaurant.address?.city || ''}`
          : storedRestaurant.address || '',
        restaurantPhone: storedRestaurant.phone || '',
        cuisine: Array.isArray(storedRestaurant.cuisine) ? storedRestaurant.cuisine.join(', ') : storedRestaurant.cuisine || '',
      }))
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Helper to get restaurant ID (handles both _id and id)
  const getRestaurantId = () => {
    return restaurantData?._id || restaurantData?.id || null
  }

  const [staffList, setStaffList] = useState([])
  const [staffSearch, setStaffSearch] = useState('')
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    position: 'Phục vụ',
    startDate: '',
    idCard: '',
    address: '',
    birthDate: '',
    emergencyContact: ''
  })

  // Load transactions
  useEffect(() => {
    const restaurantId = getRestaurantId()
    if (isVerified && restaurantId) {
      loadTransactions()
      loadStaff()
    }
  }, [isVerified, restaurantData])

  const loadStaff = async () => {
    const restaurantId = getRestaurantId()
    if (!restaurantId) {
      console.error('No restaurant ID found')
      return
    }
    
    try {
      setLoadingStaff(true)
      const token = localStorage.getItem('restaurant_token')
      const response = await axios.get(`${API_URL}/staff/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setStaffList(response.data.data || [])
      }
    } catch (error) {
      console.error('Load staff error:', error)
      // If API fails, use empty array
      setStaffList([])
    } finally {
      setLoadingStaff(false)
    }
  }

  const loadTransactions = async () => {
    const restaurantId = getRestaurantId()
    if (!restaurantId) return
    
    try {
      const token = localStorage.getItem('restaurant_token')
      const response = await axios.get(`${API_URL}/transactions/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setTransactions(response.data.data || [])
      }
    } catch (error) {
      // If API not exist yet, use empty array
      console.error('Load transactions error:', error)
      setTransactions([])
    }
  }

  const handleSavePaypal = async () => {
    const restaurantId = getRestaurantId()
    if (!restaurantId) {
      alert('Không tìm thấy thông tin nhà hàng')
      return
    }
    
    try {
      const token = localStorage.getItem('restaurant_token')
      await axios.put(`${API_URL}/restaurants/${restaurantId}`, {
        paypalEmail: formData.paypalEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update localStorage
      const updatedRestaurant = { ...restaurantData, paypalEmail: formData.paypalEmail }
      localStorage.setItem('restaurant_data', JSON.stringify(updatedRestaurant))
      setRestaurantData(updatedRestaurant)
      
      alert('Đã lưu tài khoản PayPal!')
    } catch (error) {
      console.error('Error saving PayPal:', error)
      alert('Không thể lưu tài khoản PayPal')
    }
  }

  const handleWithdraw = async () => {
    const restaurantId = getRestaurantId()
    const amount = parseInt(formData.withdrawAmount)
    
    if (!restaurantId) {
      alert('Không tìm thấy thông tin nhà hàng')
      return
    }
    
    if (!amount || amount < 100000) {
      alert('Số tiền rút tối thiểu là 100,000 VNĐ')
      return
    }
    
    if (amount > (restaurantData?.balance || 0)) {
      alert('Số dư không đủ')
      return
    }
    
    if (!formData.paypalEmail) {
      alert('Vui lòng cập nhật email PayPal trước')
      return
    }
    
    if (!confirm(`Bạn có chắc muốn rút ${amount.toLocaleString('vi-VN')} VNĐ về PayPal ${formData.paypalEmail}?`)) {
      return
    }
    
    try {
      const token = localStorage.getItem('restaurant_token')
      const response = await axios.post(`${API_URL}/transactions/withdraw`, {
        restaurantId: restaurantId,
        amount: amount,
        paypalEmail: formData.paypalEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        alert('Yêu cầu rút tiền thành công! Tiền sẽ được chuyển vào PayPal trong 1-3 ngày làm việc.')
        
        // Update balance locally
        const newBalance = (restaurantData?.balance || 0) - amount
        const updatedRestaurant = { ...restaurantData, balance: newBalance }
        localStorage.setItem('restaurant_data', JSON.stringify(updatedRestaurant))
        setRestaurantData(updatedRestaurant)
        setFormData(prev => ({ ...prev, withdrawAmount: '' }))
        
        loadTransactions()
      }
    } catch (error) {
      console.error('Error withdrawing:', error)
      alert(error.response?.data?.message || 'Không thể rút tiền. Vui lòng thử lại sau.')
    }
  }

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(staffSearch.toLowerCase())
  )

  const handleAddStaff = async (e) => {
    e.preventDefault()
    
    const restaurantId = getRestaurantId()
    
    if (!restaurantId) {
      alert('Không tìm thấy thông tin nhà hàng')
      return
    }
    
    if (!newStaff.name || !newStaff.phone || !newStaff.email || !newStaff.password) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      const token = localStorage.getItem('restaurant_token')
      const response = await axios.post(
        `${API_URL}/staff/restaurant/${restaurantId}`,
        {
          name: newStaff.name,
          phone: newStaff.phone,
          email: newStaff.email,
          password: newStaff.password,
          position: newStaff.position,
          startDate: newStaff.startDate,
          idCard: newStaff.idCard,
          address: newStaff.address,
          birthDate: newStaff.birthDate,
          emergencyContact: newStaff.emergencyContact
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        alert('Thêm nhân viên thành công!')
        setNewStaff({ 
          name: '', 
          phone: '',
          email: '',
          password: '',
          position: 'Phục vụ',
          startDate: '',
          idCard: '',
          address: '',
          birthDate: '',
          emergencyContact: ''
        })
        setShowStaffModal(false)
        loadStaff() // Reload staff list
      }
    } catch (error) {
      console.error('Add staff error:', error)
      alert(error.response?.data?.message || 'Lỗi khi thêm nhân viên')
    }
  }

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      return
    }

    try {
      const token = localStorage.getItem('restaurant_token')
      const response = await axios.delete(`${API_URL}/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        alert('Xóa nhân viên thành công!')
        loadStaff() // Reload staff list
      }
    } catch (error) {
      console.error('Delete staff error:', error)
      alert(error.response?.data?.message || 'Lỗi khi xóa nhân viên')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setVerifyError('')
    
    try {
      // Restaurant-web uses 'restaurant_user' key, not 'user'
      const storedUser = JSON.parse(localStorage.getItem('restaurant_user') || '{}')
      const email = storedUser.email
      
      console.log('🔍 Verifying with email:', email)
      console.log('🔍 Stored user:', storedUser)
      
      if (!email) {
        setVerifyError('Không tìm thấy thông tin đăng nhập')
        setIsVerifying(false)
        return
      }
      
      // Use login API to verify password
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: verifyPassword
      })
      
      console.log('✅ Verify response:', response.data)
      
      if (response.data.success) {
        setIsVerified(true)
        setShowVerifyModal(false)
        setVerifyError('')
      }
    } catch (error) {
      console.error('❌ Verify error:', error)
      console.error('❌ Error response:', error.response?.data)
      setVerifyError('Mật khẩu không chính xác')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }
    
    // Update localStorage
    const savedAccount = JSON.parse(localStorage.getItem('foodfastPartnerAccount') || '{}')
    const updatedAccount = {
      ...savedAccount,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.newPassword || savedAccount.password
    }
    localStorage.setItem('foodfastPartnerAccount', JSON.stringify(updatedAccount))
    
    alert('Cập nhật thông tin thành công!')
    navigate('/dashboard')
  }

  if (showVerifyModal) {
    return (
      <div className="verify-overlay">
        <div className="verify-modal">
          <h2>Xác minh danh tính</h2>
          <p>Vui lòng nhập mật khẩu tài khoản để tiếp tục</p>
          <form onSubmit={handleVerify}>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="verify-input"
              disabled={isVerifying}
            />
            {verifyError && <p className="verify-error">{verifyError}</p>}
            <div className="verify-actions">
              <button type="button" onClick={() => navigate(-1)} className="cancel-btn" disabled={isVerifying}>
                Hủy
              </button>
              <button type="submit" className="verify-btn" disabled={isVerifying}>
                {isVerifying ? 'Đang xác minh...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return null
  }

  return (
    <div className="account-settings-page">
      <h1>Cài đặt tài khoản</h1>
      <p className="subtitle">Quản lý thông tin cá nhân và bảo mật</p>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Thông tin cá nhân
        </button>
        <button 
          className={`tab-btn ${activeTab === 'restaurant' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurant')}
        >
          Thông tin nhà hàng
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Tài khoản thanh toán
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Quản lý nhân viên
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Đổi mật khẩu
        </button>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <form onSubmit={handleSubmit}>
            {activeTab === 'account' && (
              <>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                    Hủy
                  </button>
                  <button type="submit" className="save-btn">
                    Lưu thay đổi
                  </button>
                </div>
              </>
            )}

            {activeTab === 'restaurant' && (
              <>
                <div className="form-group">
                  <label>Tên nhà hàng</label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Nhập tên nhà hàng"
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ nhà hàng</label>
                  <input
                    type="text"
                    name="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ nhà hàng"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại nhà hàng</label>
                  <input
                    type="tel"
                    name="restaurantPhone"
                    value={formData.restaurantPhone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại nhà hàng"
                  />
                </div>

                <div className="form-group">
                  <label>Loại hình</label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="Nhập loại hình ẩm thực"
                  />
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Giờ hoạt động</h3>
                
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Giờ mở cửa</label>
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Giờ đóng cửa</label>
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ngày làm việc</label>
                  <div className="working-days">
                    {[
                      { value: 'mon', label: 'T2' },
                      { value: 'tue', label: 'T3' },
                      { value: 'wed', label: 'T4' },
                      { value: 'thu', label: 'T5' },
                      { value: 'fri', label: 'T6' },
                      { value: 'sat', label: 'T7' },
                      { value: 'sun', label: 'CN' }
                    ].map(day => (
                      <label key={day.value} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                workingDays: [...formData.workingDays, day.value]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                workingDays: formData.workingDays.filter(d => d !== day.value)
                              })
                            }
                          }}
                        />
                        <span>{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                    Hủy
                  </button>
                  <button type="submit" className="save-btn">
                    Lưu thay đổi
                  </button>
                </div>
              </>
            )}

            {activeTab === 'payment' && (
              <div className="payment-section">
                {/* Balance Card */}
                <div className="balance-card">
                  <div className="balance-header">
                    <span className="balance-icon">💰</span>
                    <span className="balance-title">Số dư khả dụng</span>
                  </div>
                  <div className="balance-amount">
                    {restaurantData?.balance?.toLocaleString('vi-VN') || '0'} VNĐ
                  </div>
                  <p className="balance-note">
                    Doanh thu từ các đơn hàng đã hoàn thành (sau khi trừ phí dịch vụ)
                  </p>
                </div>

                {/* PayPal Account */}
                <div className="paypal-section">
                  <h3>Tài khoản nhận tiền (PayPal)</h3>
                  <div className="form-group">
                    <label>Email PayPal</label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleChange}
                      placeholder="Nhập email PayPal của bạn"
                    />
                    <p className="input-note">
                      Tiền sẽ được chuyển vào tài khoản PayPal này khi bạn yêu cầu rút tiền
                    </p>
                  </div>

                  <button type="button" className="save-paypal-btn" onClick={handleSavePaypal}>
                    Lưu tài khoản PayPal
                  </button>
                </div>

                {/* Withdraw Section */}
                <div className="withdraw-section">
                  <h3>Rút tiền về PayPal</h3>
                  <div className="form-group">
                    <label>Số tiền muốn rút (VNĐ)</label>
                    <input
                      type="number"
                      name="withdrawAmount"
                      value={formData.withdrawAmount || ''}
                      onChange={handleChange}
                      placeholder="Nhập số tiền"
                      min="100000"
                      step="10000"
                    />
                    <p className="input-note">Tối thiểu: 100,000 VNĐ</p>
                  </div>

                  <button 
                    type="button" 
                    className="withdraw-btn"
                    onClick={handleWithdraw}
                    disabled={!formData.paypalEmail || (restaurantData?.balance || 0) < 100000}
                  >
                    💸 Rút tiền về PayPal
                  </button>
                </div>

                {/* Transaction History */}
                <div className="transaction-history">
                  <h3>Lịch sử giao dịch gần đây</h3>
                  <div className="transaction-list">
                    {transactions.length === 0 ? (
                      <p className="no-transactions">Chưa có giao dịch nào</p>
                    ) : (
                      transactions.map((tx, index) => (
                        <div key={index} className={`transaction-item ${tx.type}`}>
                          <div className="tx-info">
                            <span className="tx-type">{tx.type === 'income' ? '📥 Thu nhập' : '📤 Rút tiền'}</span>
                            <span className="tx-date">{new Date(tx.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <span className={`tx-amount ${tx.type}`}>
                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                    Hủy
                  </button>
                  <button type="submit" className="save-btn">
                    Lưu thay đổi
                  </button>
                </div>
              </>
            )}
          </form>

          {activeTab === 'staff' && (
            <div className="staff-tab-content">
              <div className="staff-header">
                <input
                  type="text"
                  className="staff-search"
                  placeholder="Tìm kiếm nhân viên..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
                <button type="button" onClick={() => setShowStaffModal(true)} className="add-staff-btn">
                  + Thêm nhân viên
                </button>
              </div>

              <div className="staff-list">
                {loadingStaff ? (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
                ) : filteredStaff.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    {staffSearch ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên. Nhấn "Thêm nhân viên" để bắt đầu.'}
                  </p>
                ) : (
                  filteredStaff.map(staff => (
                    <div key={staff._id} className="staff-item">
                      <div className="staff-info">
                        <span className="staff-name">{staff.name}</span>
                        <span className="staff-position">{staff.position}</span>
                        <span className="staff-login">SMS: {staff.phone}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteStaff(staff._id)} 
                        className="delete-staff-btn"
                      >
                        Xóa
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm nhân viên mới</h2>
              <button onClick={() => setShowStaffModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                  >
                    <option value="Quản lý">Quản lý</option>
                    <option value="Thu ngân">Thu ngân</option>
                    <option value="Đầu bếp">Đầu bếp</option>
                    <option value="Phụ bếp">Phụ bếp</option>
                    <option value="Phục vụ">Phục vụ</option>
                    <option value="Giao hàng">Giao hàng</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={newStaff.startDate}
                    onChange={(e) => setNewStaff({...newStaff, startDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số CCCD *</label>
                  <input
                    type="text"
                    value={newStaff.idCard}
                    onChange={(e) => setNewStaff({...newStaff, idCard: e.target.value})}
                    placeholder="VD: 001234567890"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh *</label>
                  <input
                    type="date"
                    value={newStaff.birthDate}
                    onChange={(e) => setNewStaff({...newStaff, birthDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  value={newStaff.address}
                  onChange={(e) => setNewStaff({...newStaff, address: e.target.value})}
                  placeholder="VD: 123 Nguyễn Văn A, Quận 1, TP.HCM"
                  required
                />
              </div>

              <div className="form-group">
                <label>SĐT khẩn cấp *</label>
                <input
                  type="tel"
                  value={newStaff.emergencyContact}
                  onChange={(e) => setNewStaff({...newStaff, emergencyContact: e.target.value})}
                  placeholder="Số điện thoại người thân"
                  required
                />
              </div>

              <div className="account-section">
                <h3>🔐 Thông tin đăng nhập (Bắt buộc)</h3>
                <p className="section-desc">Email và mật khẩu để nhân viên đăng nhập vào hệ thống</p>
                
                <div className="form-group">
                  <label>Email đăng nhập *</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowStaffModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="save-btn">
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountSettings
