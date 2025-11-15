import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AccountSettings.css'

function AccountSettings() {
  const navigate = useNavigate()
  const [showVerifyModal, setShowVerifyModal] = useState(true)
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [activeTab, setActiveTab] = useState('account') // 'account', 'restaurant', 'payment', 'staff', 'password'

  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    bankName: 'Vietcombank',
    bankAccountNumber: '0123456789',
    bankAccountName: 'NGUYEN VAN A',
    bankBranch: 'Chi nhánh Quận 1',
    restaurantName: 'Bún Bò Huế Mỹ Tho',
    restaurantAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    restaurantPhone: '0901234567',
    cuisine: 'Ẩm thực Việt',
    openTime: '06:00',
    closeTime: '22:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  })

  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Nguyễn Văn B', position: 'Quản lý', phone: '0901234567' },
    { id: 2, name: 'Trần Thị C', position: 'Thu ngân', phone: '0912345678' },
    { id: 3, name: 'Lê Văn D', position: 'Đầu bếp', phone: '0923456789' }
  ])
  const [staffSearch, setStaffSearch] = useState('')
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: 'Phục vụ',
    phone: ''
  })

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(staffSearch.toLowerCase())
  )

  const handleAddStaff = (e) => {
    e.preventDefault()
    const staff = {
      id: Date.now(),
      ...newStaff
    }
    setStaffList([...staffList, staff])
    setNewStaff({ name: '', position: 'Phục vụ', phone: '' })
    setShowStaffModal(false)
  }

  const handleDeleteStaff = (id) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      setStaffList(staffList.filter(s => s.id !== id))
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    const savedAccount = JSON.parse(localStorage.getItem('foodfastPartnerAccount') || '{}')
    
    if (verifyPassword === savedAccount.password) {
      setIsVerified(true)
      setShowVerifyModal(false)
      setVerifyError('')
    } else {
      setVerifyError('Mật khẩu không chính xác')
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
          <p>Vui lòng nhập mật khẩu để tiếp tục</p>
          <form onSubmit={handleVerify}>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="verify-input"
            />
            {verifyError && <p className="verify-error">{verifyError}</p>}
            <div className="verify-actions">
              <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                Hủy
              </button>
              <button type="submit" className="verify-btn">
                Xác nhận
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
              <>
                <div className="form-group">
                  <label>Ngân hàng</label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                  >
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="Agribank">Agribank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="ACB">ACB</option>
                    <option value="VPBank">VPBank</option>
                    <option value="TPBank">TPBank</option>
                    <option value="Sacombank">Sacombank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Số tài khoản</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="Nhập số tài khoản"
                  />
                </div>

                <div className="form-group">
                  <label>Tên tài khoản</label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    placeholder="Nhập tên tài khoản (viết hoa không dấu)"
                  />
                </div>

                <div className="form-group">
                  <label>Chi nhánh</label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={formData.bankBranch}
                    onChange={handleChange}
                    placeholder="Nhập chi nhánh ngân hàng"
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
                {filteredStaff.map(staff => (
                  <div key={staff.id} className="staff-item">
                    <div className="staff-info">
                      <span className="staff-name">{staff.name}</span>
                      <span className="staff-position">{staff.position}</span>
                      <span className="staff-login">SMS: {staff.phone}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleDeleteStaff(staff.id)} 
                      className="delete-staff-btn"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
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
              <div className="form-group">
                <label>Tên nhân viên</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại (Đăng nhập SMS)</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                  maxLength="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <select
                  value={newStaff.position}
                  onChange={(e) => setNewStaff({...newStaff, position: e.target.value})}
                >
                  <option value="Quản lý">Quản lý</option>
                  <option value="Thu ngân">Thu ngân</option>
                  <option value="Đầu bếp">Đầu bếp</option>
                  <option value="Phục vụ">Phục vụ</option>
                  <option value="Giao hàng">Giao hàng</option>
                </select>
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
