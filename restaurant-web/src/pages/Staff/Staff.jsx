import { useState } from 'react'
import './Staff.css'

function Staff() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)

  const [staff, setStaff] = useState([
    {
      id: 'NV001',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      position: 'Quản lý',
      salary: 15000000,
      startDate: '2024-01-15',
      status: 'active',
      avatar: null,
      idCard: '079024567890',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      birthDate: '1990-05-20',
      emergencyContact: '0987654321',
      workSchedule: 'Ca sáng'
    },
    {
      id: 'NV002',
      name: 'Trần Thị B',
      phone: '0912345678',
      email: 'tranthib@email.com',
      position: 'Thu ngân',
      salary: 8000000,
      startDate: '2024-03-10',
      status: 'active',
      avatar: null,
      idCard: '079024567891',
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      birthDate: '1995-08-15',
      emergencyContact: '0976543210',
      workSchedule: 'Ca chiều'
    },
    {
      id: 'NV003',
      name: 'Lê Văn C',
      phone: '0923456789',
      email: 'levanc@email.com',
      position: 'Đầu bếp',
      salary: 12000000,
      startDate: '2024-02-20',
      status: 'active',
      avatar: null,
      idCard: '079024567892',
      address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
      birthDate: '1988-12-10',
      emergencyContact: '0965432109',
      workSchedule: 'Full time'
    },
    {
      id: 'NV004',
      name: 'Phạm Thị D',
      phone: '0934567890',
      email: 'phamthid@email.com',
      position: 'Phục vụ',
      salary: 7000000,
      startDate: '2024-04-05',
      status: 'active',
      avatar: null,
      idCard: '079024567893',
      address: '321 Võ Văn Tần, Quận 3, TP.HCM',
      birthDate: '1998-03-25',
      emergencyContact: '0954321098',
      workSchedule: 'Ca sáng'
    },
    {
      id: 'NV005',
      name: 'Hoàng Văn E',
      phone: '0945678901',
      email: 'hoangvane@email.com',
      position: 'Phục vụ',
      salary: 7000000,
      startDate: '2024-05-15',
      status: 'inactive',
      avatar: null,
      idCard: '079024567894',
      address: '654 Pasteur, Quận 3, TP.HCM',
      birthDate: '1997-07-18',
      emergencyContact: '0943210987',
      workSchedule: 'Ca chiều'
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: 'Phục vụ',
    salary: '',
    startDate: '',
    idCard: '',
    address: '',
    birthDate: '',
    emergencyContact: '',
    workSchedule: 'Ca sáng',
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

  const workSchedules = [
    { value: 'Ca sáng', label: 'Ca sáng (6h-14h)' },
    { value: 'Ca chiều', label: 'Ca chiều (14h-22h)' },
    { value: 'Full time', label: 'Full time (6h-22h)' },
  ]

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
    const { name, value, files } = e.target

    if (name === 'avatar') {
      setFormData({
        ...formData,
        [name]: files[0]
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleAddStaff = (e) => {
    e.preventDefault()
    const newStaff = {
      id: `NV${String(staff.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'active',
      salary: parseInt(formData.salary)
    }
    setStaff([...staff, newStaff])
    setShowAddModal(false)
    resetForm()
  }

  const handleEditStaff = (e) => {
    e.preventDefault()
    const updatedStaff = staff.map(s =>
      s.id === selectedStaff.id
        ? {
            ...s,
            ...formData,
            salary: parseInt(formData.salary),
            avatar: formData.avatar || s.avatar
          }
        : s
    )
    setStaff(updatedStaff)
    setShowEditModal(false)
    setSelectedStaff(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      position: 'Phục vụ',
      salary: '',
      startDate: '',
      idCard: '',
      address: '',
      birthDate: '',
      emergencyContact: '',
      workSchedule: 'Ca sáng',
      avatar: null
    })
  }

  const toggleStatus = (id) => {
    setStaff(staff.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ))
  }

  const deleteStaff = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      setStaff(staff.filter(s => s.id !== id))
    }
  }

  const openEditModal = (member) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email,
      position: member.position,
      salary: member.salary.toString(),
      startDate: member.startDate,
      idCard: member.idCard,
      address: member.address,
      birthDate: member.birthDate,
      emergencyContact: member.emergencyContact,
      workSchedule: member.workSchedule,
      avatar: null
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
              <th>Ca làm việc</th>
              <th>Lương</th>
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
                  <span className="schedule-badge">{member.workSchedule}</span>
                </td>
                <td>
                  <span className="salary">{member.salary.toLocaleString('vi-VN')}đ</span>
                </td>
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
                  <label>Lương (VNĐ) *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    min="1000000"
                    step="500000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Ca làm việc *</label>
                  <select name="workSchedule" value={formData.workSchedule} onChange={handleChange}>
                    {workSchedules.map(schedule => (
                      <option key={schedule.value} value={schedule.value}>{schedule.label}</option>
                    ))}
                  </select>
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
                  <label>Lương (VNĐ) *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    min="1000000"
                    step="500000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Ca làm việc *</label>
                  <select name="workSchedule" value={formData.workSchedule} onChange={handleChange}>
                    {workSchedules.map(schedule => (
                      <option key={schedule.value} value={schedule.value}>{schedule.label}</option>
                    ))}
                  </select>
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
                  <span className="info-label">Lương</span>
                  <span className="info-value salary-highlight">{selectedStaff.salary.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ca làm việc</span>
                  <span className="info-value">{selectedStaff.workSchedule}</span>
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
