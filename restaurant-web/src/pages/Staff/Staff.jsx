import { useState, useEffect } from 'react'
import { staffAPI } from '../../services/api'
import './Staff.css'

function Staff() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState([])
  
  // Get restaurant ID from localStorage
  const restaurantData = JSON.parse(localStorage.getItem('restaurant_data') || '{}')
  const restaurantId = restaurantData._id

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    position: 'Phục vụ',
    startDate: '',
    idCard: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    avatar: null
  })

  const positions = [
    { value: 'Quản lý', label: 'Quản lý' },
    { value: 'Thu ngân', label: 'Thu ngân' },
    { value: 'Đầu bếp', label: 'Đầu bếp' },
    { value: 'Phụ bếp', label: 'Phụ bếp' },
    { value: 'Phục vụ', label: 'Phục vụ' },
    { value: 'Giao hàng', label: 'Giao hàng' },
  ]

  // Load staff from API
  useEffect(() => {
    loadStaff()
  }, [restaurantId])

  const loadStaff = async () => {
    if (!restaurantId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const response = await staffAPI.getByRestaurant(restaurantId)
      if (response.success && response.data) {
        // Transform API data to match UI format
        const transformedStaff = response.data.map(s => ({
          id: s._id,
          name: s.name,
          phone: s.phone,
          email: s.email || '',
          position: s.position,
          startDate: s.startDate ? s.startDate.split('T')[0] : '',
          status: s.isActive ? 'active' : 'inactive',
          avatar: s.avatar,
          idCard: s.idCard || '',
          address: s.address || '',
          birthDate: s.birthDate ? s.birthDate.split('T')[0] : '',
          emergencyContact: s.emergencyContact || ''
        }))
        setStaff(transformedStaff)
      }
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredStaff = () => {
    let filtered = staff

    if (activeTab === 'active') {
      filtered = filtered.filter(s => s.status === 'active')
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(s => s.status === 'inactive')
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
      )
    }

    return filtered
  }

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target

    if (name === 'avatar') {
      setFormData({
        ...formData,
        [name]: files[0]
      })
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleAddStaff = async (e) => {
    e.preventDefault()
    try {
      const staffData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        startDate: formData.startDate,
        idCard: formData.idCard,
        address: formData.address,
        birthDate: formData.birthDate,
        emergencyContact: formData.emergencyContact
      }

      const response = await staffAPI.create(restaurantId, staffData)
      if (response.success) {
        alert(response.message || 'Thêm nhân viên thành công!')
        setShowAddModal(false)
        resetForm()
        loadStaff()
      }
    } catch (error) {
      console.error('Error adding staff:', error)
      alert(error.message || 'Lỗi khi thêm nhân viên')
    }
  }

  const handleEditStaff = async (e) => {
    e.preventDefault()
    try {
      const staffData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        startDate: formData.startDate,
        idCard: formData.idCard,
        address: formData.address,
        birthDate: formData.birthDate,
        emergencyContact: formData.emergencyContact
      }

      const response = await staffAPI.update(selectedStaff.id, staffData)
      if (response.success) {
        alert('Cập nhật nhân viên thành công!')
        setShowEditModal(false)
        setSelectedStaff(null)
        resetForm()
        loadStaff()
      }
    } catch (error) {
      console.error('Error updating staff:', error)
      alert(error.message || 'Lỗi khi cập nhật nhân viên')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      position: 'Phục vụ',
      startDate: '',
      idCard: '',
      address: '',
      birthDate: '',
      emergencyContact: '',
      avatar: null
    })
  }

  const toggleStatus = async (id) => {
    try {
      const member = staff.find(s => s.id === id)
      const newStatus = member.status === 'active' ? false : true
      const response = await staffAPI.update(id, { isActive: newStatus })
      if (response.success) {
        loadStaff()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      alert(error.message || 'Lỗi khi thay đổi trạng thái')
    }
  }

  const deleteStaff = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        const response = await staffAPI.delete(id)
        if (response.success) {
          alert('Xóa nhân viên thành công!')
          loadStaff()
        }
      } catch (error) {
        console.error('Error deleting staff:', error)
        alert(error.message || 'Lỗi khi xóa nhân viên')
      }
    }
  }

  const openEditModal = (member) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      position: member.position,
      salary: member.salary?.toString() || '',
      startDate: member.startDate,
      idCard: member.idCard || '',
      address: member.address || '',
      birthDate: member.birthDate,
      emergencyContact: member.emergencyContact || '',
      workSchedule: member.workSchedule,
      avatar: null,
      createAccount: false,
      password: ''
    })
    setShowEditModal(true)
  }

  const openDetailModal = (member) => {
    setSelectedStaff(member)
    setShowDetailModal(true)
  }

  const filteredStaff = getFilteredStaff()

  return (
    <div className="staff-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhân viên</h1>
          <p className="subtitle">Quản lý thông tin và lịch làm việc nhân viên</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="add-btn">
          + Thêm nhân viên
        </button>
      </div>

      <div className="staff-stats">
        <div className="stat-card">
          <span className="stat-number">{staff.length}</span>
          <span className="stat-label">Tổng nhân viên</span>
        </div>
        <div className="stat-card active">
          <span className="stat-number">{staff.filter(s => s.status === 'active').length}</span>
          <span className="stat-label">Đang làm việc</span>
        </div>
        <div className="stat-card inactive">
          <span className="stat-number">{staff.filter(s => s.status === 'inactive').length}</span>
          <span className="stat-label">Nghỉ việc</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{new Set(staff.map(s => s.position)).size}</span>
          <span className="stat-label">Vị trí công việc</span>
        </div>
      </div>

      <div className="staff-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã NV, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
            <span className="tab-count">{staff.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Đang làm
            <span className="tab-count">{staff.filter(s => s.status === 'active').length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveTab('inactive')}
          >
            Nghỉ việc
            <span className="tab-count">{staff.filter(s => s.status === 'inactive').length}</span>
          </button>
        </div>
      </div>

      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và tên</th>
              <th>Vị trí</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(member => (
              <tr key={member.id}>
                <td>
                  <span className="staff-id">{member.id}</span>
                </td>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">
                      {member.avatar ? (
                        <img src={URL.createObjectURL(member.avatar)} alt={member.name} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <div className="staff-name">{member.name}</div>
                      <div className="staff-email">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="position-badge">{member.position}</span>
                </td>
                <td>{member.phone}</td>
                <td>
                  <span className={`status-badge ${member.status}`}>
                    {member.status === 'active' ? 'Đang làm' : 'Nghỉ việc'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => openDetailModal(member)}
                      className="action-btn btn-view"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openEditModal(member)}
                      className="action-btn btn-edit"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => toggleStatus(member.id)}
                      className={`action-btn ${member.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      {member.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => deleteStaff(member.id)}
                      className="action-btn btn-delete"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStaff.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>Không tìm thấy nhân viên</h3>
            <p>Hãy thêm nhân viên mới hoặc thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm nhân viên mới</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select name="position" value={formData.position} onChange={handleChange}>
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số CCCD *</label>
                  <input
                    type="text"
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>SĐT khẩn cấp *</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ảnh đại diện</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>

              {/* Account Creation Section - Now Required */}
              <div className="account-section">
                <h3>🔐 Thông tin đăng nhập (Bắt buộc)</h3>
                <p className="section-desc">Email và mật khẩu để nhân viên đăng nhập vào hệ thống</p>
                
                <div className="form-group">
                  <label>Email đăng nhập *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Thêm nhân viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin nhân viên</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select name="position" value={formData.position} onChange={handleChange}>
                    {positions.map(pos => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số CCCD *</label>
                  <input
                    type="text"
                    name="idCard"
                    value={formData.idCard}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>SĐT khẩn cấp *</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ảnh đại diện mới (để trống nếu không đổi)</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin chi tiết nhân viên</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="detail-content">
              <div className="detail-avatar-section">
                <div className="detail-avatar-large">
                  {selectedStaff.avatar ? (
                    <img src={URL.createObjectURL(selectedStaff.avatar)} alt={selectedStaff.name} />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <h3>{selectedStaff.name}</h3>
                <span className={`status-badge-large ${selectedStaff.status}`}>
                  {selectedStaff.status === 'active' ? 'Đang làm việc' : 'Nghỉ việc'}
                </span>
              </div>

              <div className="detail-info-grid">
                <div className="info-item">
                  <span className="info-label">Mã nhân viên</span>
                  <span className="info-value">{selectedStaff.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vị trí</span>
                  <span className="info-value">{selectedStaff.position}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số điện thoại</span>
                  <span className="info-value">{selectedStaff.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{selectedStaff.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày bắt đầu</span>
                  <span className="info-value">{new Date(selectedStaff.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngày sinh</span>
                  <span className="info-value">{new Date(selectedStaff.birthDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Số CCCD</span>
                  <span className="info-value">{selectedStaff.idCard}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Địa chỉ</span>
                  <span className="info-value">{selectedStaff.address}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">SĐT khẩn cấp</span>
                  <span className="info-value">{selectedStaff.emergencyContact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff
