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
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [userData, setUserData] = useState(null)
  const [settings, setSettings] = useState({
    paypalEmail: '',
    paypalClientId: '',
    paypalClientSecret: '',
    commissionRate: 10,
    minWithdrawAmount: 100000,
    autoPayoutEnabled: false,
    autoPayoutThreshold: 1000000,
    systemBalance: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalPayouts: 0,
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [financialData, setFinancialData] = useState({
    pendingWithdrawals: 0,
    totalRestaurantBalances: 0,
    transactionSummary: [],
    todayTransactions: [],
  })

  // Load data after verification
  useEffect(() => {
    if (isVerified) {
      loadUserData()
      loadSettings()
      loadFinancialSummary()
    }
  }, [isVerified])

  const loadUserData = () => {
    const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
    setUserData(storedUser)
    setFormData(prev => ({
      ...prev,
      fullName: storedUser.name || '',
      email: storedUser.email || '',
      phone: storedUser.phone || '',
    }))
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await axios.get(`${API_URL}/admin-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const data = response.data.data
        setSettings({
          paypalEmail: data.paypalEmail || '',
          paypalClientId: data.paypalClientId || '',
          paypalClientSecret: data.paypalClientSecret || '',
          commissionRate: data.commissionRate || 10,
          minWithdrawAmount: data.minWithdrawAmount || 100000,
          autoPayoutEnabled: data.autoPayoutEnabled || false,
          autoPayoutThreshold: data.autoPayoutThreshold || 1000000,
          systemBalance: data.systemBalance || 0,
          totalRevenue: data.totalRevenue || 0,
          totalCommission: data.totalCommission || 0,
          totalPayouts: data.totalPayouts || 0,
        })
        setFinancialData(prev => ({
          ...prev,
          pendingWithdrawals: data.pendingWithdrawals || 0,
          totalRestaurantBalances: data.totalRestaurantBalances || 0,
        }))
      }
    } catch (error) {
      console.error('Load settings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFinancialSummary = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await axios.get(`${API_URL}/admin-settings/financial-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const data = response.data.data
        setFinancialData({
          pendingWithdrawals: data.pendingWithdrawals?.length || 0,
          totalRestaurantBalances: data.totalRestaurantBalances || 0,
          transactionSummary: data.transactionSummary || [],
          todayTransactions: data.todayTransactions || [],
        })
      }
    } catch (error) {
      console.error('Load financial summary error:', error)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setVerifyError('')
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
      const email = storedUser.email
      
      if (!email) {
        setVerifyError('Không tìm thấy thông tin đăng nhập')
        setIsVerifying(false)
        return
      }
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: verifyPassword
      })
      
      if (response.data.success) {
        setIsVerified(true)
        setShowVerifyModal(false)
        setVerifyError('')
      }
    } catch (error) {
      console.error('Verify error:', error)
      setVerifyError('Mật khẩu không chính xác')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await axios.put(`${API_URL}/admin-settings`, {
        paypalEmail: settings.paypalEmail,
        paypalClientId: settings.paypalClientId,
        paypalClientSecret: settings.paypalClientSecret,
        commissionRate: settings.commissionRate,
        minWithdrawAmount: settings.minWithdrawAmount,
        autoPayoutEnabled: settings.autoPayoutEnabled,
        autoPayoutThreshold: settings.autoPayoutThreshold,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        alert('Lưu cài đặt thành công!')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      alert('Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!formData.currentPassword || !formData.newPassword) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }
    
    if (formData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        alert('Đổi mật khẩu thành công!')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      }
    } catch (error) {
      console.error('Change password error:', error)
      alert(error.response?.data?.message || 'Lỗi khi đổi mật khẩu')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (showVerifyModal) {
    return (
      <div className="verify-overlay">
        <div className="verify-modal">
          <h2>🔐 Xác minh danh tính</h2>
          <p>Vui lòng nhập mật khẩu Admin để tiếp tục</p>
          <form onSubmit={handleVerify}>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="verify-input"
              disabled={isVerifying}
              autoFocus
            />
            {verifyError && <p className="verify-error">{verifyError}</p>}
            <div className="verify-actions">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="cancel-btn" 
                disabled={isVerifying}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="verify-btn" 
                disabled={isVerifying}
              >
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
      <h1>⚙️ Cài đặt hệ thống</h1>
      <p className="subtitle">Quản lý tài khoản Admin và cấu hình thanh toán</p>

      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span className="material-icons">person</span>
          Thông tin cá nhân
        </button>
        <button 
          className={`tab-btn ${activeTab === 'paypal' ? 'active' : ''}`}
          onClick={() => setActiveTab('paypal')}
        >
          <span className="material-icons">account_balance_wallet</span>
          Cấu hình PayPal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'commission' ? 'active' : ''}`}
          onClick={() => setActiveTab('commission')}
        >
          <span className="material-icons">percent</span>
          Hoa hồng & Rút tiền
        </button>
        <button 
          className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <span className="material-icons">analytics</span>
          Báo cáo tài chính
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <span className="material-icons">lock</span>
          Đổi mật khẩu
        </button>
      </div>

      <div className="settings-container">
        {loading ? (
          <div className="loading-container">
            <span className="material-icons spinning">sync</span>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="settings-section">
            {/* Tab: Thông tin cá nhân */}
            {activeTab === 'account' && (
              <div className="tab-content">
                <h2>Thông tin cá nhân</h2>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                  <small>Email không thể thay đổi</small>
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Tab: Cấu hình PayPal */}
            {activeTab === 'paypal' && (
              <div className="tab-content">
                <h2>💳 Cấu hình tài khoản PayPal</h2>
                
                <div className="form-group">
                  <label>Email PayPal *</label>
                  <input
                    type="email"
                    name="paypalEmail"
                    value={settings.paypalEmail}
                    onChange={handleSettingsChange}
                    placeholder="admin@foodfast.com"
                  />
                  <small>Email tài khoản PayPal Business của Admin</small>
                </div>
                
                <div className="form-group">
                  <label>Client ID (Sandbox/Live)</label>
                  <input
                    type="text"
                    name="paypalClientId"
                    value={settings.paypalClientId}
                    onChange={handleSettingsChange}
                    placeholder="AaB1..."
                  />
                  <small>Đã cấu hình trong backend .env</small>
                </div>
                
                <div className="form-group">
                  <label>Client Secret</label>
                  <input
                    type="password"
                    name="paypalClientSecret"
                    value={settings.paypalClientSecret}
                    onChange={handleSettingsChange}
                    placeholder="••••••••"
                  />
                  <small>Để trống nếu không muốn thay đổi</small>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt PayPal'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Hoa hồng & Rút tiền */}
            {activeTab === 'commission' && (
              <div className="tab-content">
                <h2>💰 Cài đặt hoa hồng & Rút tiền</h2>
                
                <div className="form-group">
                  <label>Tỷ lệ hoa hồng (%)</label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={settings.commissionRate}
                    onChange={handleSettingsChange}
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <small>Phần trăm FoodFast thu từ mỗi đơn hàng</small>
                </div>
                
                <div className="form-group">
                  <label>Số tiền rút tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    name="minWithdrawAmount"
                    value={settings.minWithdrawAmount}
                    onChange={handleSettingsChange}
                    min="0"
                    step="10000"
                  />
                  <small>Nhà hàng phải có ít nhất số tiền này mới được rút</small>
                </div>

                <div className="divider"></div>

                <h3>Tự động chi trả</h3>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="autoPayoutEnabled"
                      checked={settings.autoPayoutEnabled}
                      onChange={handleSettingsChange}
                    />
                    <span>Bật tự động chi trả</span>
                  </label>
                  <small>Tự động duyệt yêu cầu rút tiền khi đủ điều kiện</small>
                </div>
                
                {settings.autoPayoutEnabled && (
                  <div className="form-group">
                    <label>Ngưỡng tự động chi trả (VNĐ)</label>
                    <input
                      type="number"
                      name="autoPayoutThreshold"
                      value={settings.autoPayoutThreshold}
                      onChange={handleSettingsChange}
                      min="0"
                      step="100000"
                    />
                    <small>Tự động duyệt khi số tiền rút dưới ngưỡng này</small>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Báo cáo tài chính */}
            {activeTab === 'financial' && (
              <div className="tab-content">
                <h2>📊 Báo cáo tài chính</h2>
                
                <div className="financial-stats">
                  <div className="stat-card balance">
                    <span className="material-icons">account_balance</span>
                    <div className="stat-info">
                      <span className="stat-label">Số dư hệ thống</span>
                      <span className="stat-value">{formatCurrency(settings.systemBalance)}</span>
                    </div>
                  </div>
                  
                  <div className="stat-card revenue">
                    <span className="material-icons">trending_up</span>
                    <div className="stat-info">
                      <span className="stat-label">Tổng doanh thu</span>
                      <span className="stat-value">{formatCurrency(settings.totalRevenue)}</span>
                    </div>
                  </div>
                  
                  <div className="stat-card commission">
                    <span className="material-icons">savings</span>
                    <div className="stat-info">
                      <span className="stat-label">Tổng hoa hồng</span>
                      <span className="stat-value">{formatCurrency(settings.totalCommission)}</span>
                    </div>
                  </div>
                  
                  <div className="stat-card payout">
                    <span className="material-icons">payments</span>
                    <div className="stat-info">
                      <span className="stat-label">Đã chi trả</span>
                      <span className="stat-value">{formatCurrency(settings.totalPayouts)}</span>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <h3>Tình hình hiện tại</h3>
                <div className="current-stats">
                  <div className="current-stat">
                    <span className="label">Tổng số dư nhà hàng:</span>
                    <span className="value">{formatCurrency(financialData.totalRestaurantBalances)}</span>
                  </div>
                  <div className="current-stat pending">
                    <span className="label">Yêu cầu rút tiền đang chờ:</span>
                    <span className="value">{financialData.pendingWithdrawals} yêu cầu</span>
                  </div>
                </div>

                <div className="info-box warning">
                  <span className="material-icons">warning</span>
                  <p>
                    <strong>Lưu ý:</strong> Số dư hệ thống phải luôn ≥ Tổng số dư nhà hàng 
                    để đảm bảo có đủ tiền chi trả cho tất cả nhà hàng.
                  </p>
                </div>

                <div className="form-actions">
                  <button 
                    className="refresh-btn"
                    onClick={() => {
                      loadSettings()
                      loadFinancialSummary()
                    }}
                  >
                    <span className="material-icons">refresh</span>
                    Làm mới dữ liệu
                  </button>
                  <button 
                    className="view-transactions-btn"
                    onClick={() => navigate('/transactions')}
                  >
                    <span className="material-icons">receipt_long</span>
                    Xem tất cả giao dịch
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Đổi mật khẩu */}
            {activeTab === 'password' && (
              <div className="tab-content">
                <h2>🔑 Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
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
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSettings
