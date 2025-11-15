import { useState } from 'react'
import './Drones.css'

function Drones() {
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDrone, setSelectedDrone] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [drones, setDrones] = useState([
    {
      id: 'DR001',
      name: 'FoodFast Drone 01',
      model: 'FF-D100',
      status: 'delivering',
      battery: 85,
      currentOrder: 'FF1003',
      totalFlights: 245,
      totalDistance: 1230,
      lastMaintenance: '10/11/2024',
      nextMaintenance: '10/12/2024',
      location: 'Quận 1, TP.HCM',
      maxWeight: 5,
      maxDistance: 15,
      averageSpeed: 45
    },
    {
      id: 'DR002',
      name: 'FoodFast Drone 02',
      model: 'FF-D100',
      status: 'available',
      battery: 100,
      currentOrder: null,
      totalFlights: 198,
      totalDistance: 980,
      lastMaintenance: '12/11/2024',
      nextMaintenance: '12/12/2024',
      location: 'Quận 3, TP.HCM',
      maxWeight: 5,
      maxDistance: 15,
      averageSpeed: 45
    },
    {
      id: 'DR003',
      name: 'FoodFast Drone 03',
      model: 'FF-D200',
      status: 'charging',
      battery: 45,
      currentOrder: null,
      totalFlights: 312,
      totalDistance: 1580,
      lastMaintenance: '08/11/2024',
      nextMaintenance: '08/12/2024',
      location: 'Quận 1, TP.HCM',
      maxWeight: 7,
      maxDistance: 20,
      averageSpeed: 50
    },
    {
      id: 'DR004',
      name: 'FoodFast Drone 04',
      model: 'FF-D100',
      status: 'maintenance',
      battery: 0,
      currentOrder: null,
      totalFlights: 156,
      totalDistance: 745,
      lastMaintenance: '14/11/2024',
      nextMaintenance: '14/12/2024',
      location: 'Trạm bảo trì',
      maxWeight: 5,
      maxDistance: 15,
      averageSpeed: 45
    },
    {
      id: 'DR005',
      name: 'FoodFast Drone 05',
      model: 'FF-D200',
      status: 'available',
      battery: 92,
      currentOrder: null,
      totalFlights: 289,
      totalDistance: 1456,
      lastMaintenance: '13/11/2024',
      nextMaintenance: '13/12/2024',
      location: 'Quận 5, TP.HCM',
      maxWeight: 7,
      maxDistance: 20,
      averageSpeed: 50
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    uavRegistrationCode: '',
    model: 'FF-D100',
    firmwareVersion: '',
    operatingLicense: null,
    maxWeight: 5,
    maxDistance: 15,
    averageSpeed: 45,
    batteryCapacity: '',
    cargoCompartmentSize: ''
  })

  const getFilteredDrones = () => {
    switch(activeTab) {
      case 'all':
        return drones
      case 'available':
        return drones.filter(d => d.status === 'available')
      case 'delivering':
        return drones.filter(d => d.status === 'delivering')
      case 'charging':
        return drones.filter(d => d.status === 'charging')
      case 'maintenance':
        return drones.filter(d => d.status === 'maintenance')
      default:
        return drones
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'operatingLicense') {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const newDrone = {
      id: `DR${String(drones.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'available',
      battery: 100,
      currentOrder: null,
      totalFlights: 0,
      totalDistance: 0,
      lastMaintenance: new Date().toLocaleDateString('vi-VN'),
      nextMaintenance: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('vi-VN'),
      location: 'Trạm chính'
    }
    setDrones([...drones, newDrone])
    setShowAddModal(false)
    setFormData({
      name: '',
      serialNumber: '',
      uavRegistrationCode: '',
      model: 'FF-D100',
      firmwareVersion: '',
      operatingLicense: null,
      maxWeight: 5,
      maxDistance: 15,
      averageSpeed: 45,
      batteryCapacity: '',
      cargoCompartmentSize: ''
    })
  }

  const handleDroneClick = (drone) => {
    setSelectedDrone(drone)
    setShowDetailModal(true)
  }

  const updateDroneStatus = (droneId, newStatus) => {
    setDrones(drones.map(drone =>
      drone.id === droneId ? { ...drone, status: newStatus } : drone
    ))
  }

  const deleteDrone = (droneId) => {
    if (window.confirm('Bạn có chắc muốn xóa drone này?')) {
      setDrones(drones.filter(d => d.id !== droneId))
      setShowDetailModal(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#52c41a'
      case 'delivering': return '#1890ff'
      case 'charging': return '#fa8c16'
      case 'maintenance': return '#ff4d4f'
      default: return '#8c8c8c'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Sẵn sàng'
      case 'delivering': return 'Đang giao hàng'
      case 'charging': return 'Đang sạc'
      case 'maintenance': return 'Bảo trì'
      default: return 'Không xác định'
    }
  }

  const filteredDrones = getFilteredDrones()

  return (
    <div className="drones-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Drone (Thời gian thực)</h1>
          <p className="subtitle">Theo dõi và quản lý đội drone giao hàng</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="add-btn">
          + Thêm Drone mới
        </button>
      </div>

      <div className="drones-stats">
        <div className="stat-card">
          <span className="stat-number">{drones.length}</span>
          <span className="stat-label">Tổng số Drone</span>
        </div>
        <div className="stat-card available">
          <span className="stat-number">{drones.filter(d => d.status === 'available').length}</span>
          <span className="stat-label">Sẵn sàng</span>
        </div>
        <div className="stat-card delivering">
          <span className="stat-number">{drones.filter(d => d.status === 'delivering').length}</span>
          <span className="stat-label">Đang giao</span>
        </div>
        <div className="stat-card charging">
          <span className="stat-number">{drones.filter(d => d.status === 'charging').length}</span>
          <span className="stat-label">Đang sạc</span>
        </div>
      </div>

      <div className="drones-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
          <span className="tab-count">{drones.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Sẵn sàng
          <span className="tab-count">{drones.filter(d => d.status === 'available').length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'delivering' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivering')}
        >
          Đang giao
          <span className="tab-count">{drones.filter(d => d.status === 'delivering').length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'charging' ? 'active' : ''}`}
          onClick={() => setActiveTab('charging')}
        >
          Đang sạc
          <span className="tab-count">{drones.filter(d => d.status === 'charging').length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Bảo trì
          <span className="tab-count">{drones.filter(d => d.status === 'maintenance').length}</span>
        </button>
      </div>

      <div className="drones-grid">
        {filteredDrones.map(drone => (
          <div key={drone.id} className="drone-card" onClick={() => handleDroneClick(drone)}>
            <div className="drone-header">
              <div className="drone-icon" style={{ borderColor: getStatusColor(drone.status) }}>
                <span>✈</span>
              </div>
              <span className={`drone-status ${drone.status}`}>
                {getStatusText(drone.status)}
              </span>
            </div>

            <div className="drone-info">
              <h3>{drone.name}</h3>
              <p className="drone-id">ID: {drone.id}</p>
              <p className="drone-model">Model: {drone.model}</p>
            </div>

            <div className="drone-battery">
              <div className="battery-header">
                <span>Pin</span>
                <span className={`battery-value ${drone.battery < 20 ? 'low' : drone.battery < 50 ? 'medium' : ''}`}>
                  {drone.battery}%
                </span>
              </div>
              <div className="battery-bar">
                <div 
                  className={`battery-fill ${drone.battery < 20 ? 'low' : drone.battery < 50 ? 'medium' : ''}`}
                  style={{ width: `${drone.battery}%` }}
                ></div>
              </div>
            </div>

            <div className="drone-stats">
              <div className="stat-item">
                <span className="stat-icon">✈</span>
                <span className="stat-text">{drone.totalFlights} chuyến</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">↔</span>
                <span className="stat-text">{drone.totalDistance} km</span>
              </div>
            </div>

            {drone.currentOrder && (
              <div className="current-order">
                <span>Đơn hàng: #{drone.currentOrder}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Drone mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Drone *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Serial Number *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mã đăng ký UAV *</label>
                  <input
                    type="text"
                    name="uavRegistrationCode"
                    value={formData.uavRegistrationCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Model *</label>
                <select name="model" value={formData.model} onChange={handleChange}>
                  <option value="FF-D100">FF-D100 (Cơ bản)</option>
                  <option value="FF-D200">FF-D200 (Nâng cao)</option>
                  <option value="FF-D300">FF-D300 (Cao cấp)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Firmware Version *</label>
                  <input
                    type="text"
                    name="firmwareVersion"
                    value={formData.firmwareVersion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pin (mAh) *</label>
                  <input
                    type="number"
                    name="batteryCapacity"
                    value={formData.batteryCapacity}
                    onChange={handleChange}
                    min="3000"
                    max="15000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giấy phép vận hành drone (PDF/Ảnh) *</label>
                <input
                  type="file"
                  name="operatingLicense"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tải trọng tối đa (kg) *</label>
                  <input
                    type="number"
                    name="maxWeight"
                    value={formData.maxWeight}
                    onChange={handleChange}
                    min="3"
                    max="10"
                    step="0.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tầm bay tối đa (km) *</label>
                  <input
                    type="number"
                    name="maxDistance"
                    value={formData.maxDistance}
                    onChange={handleChange}
                    min="10"
                    max="30"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tốc độ trung bình (km/h) *</label>
                  <input
                    type="number"
                    name="averageSpeed"
                    value={formData.averageSpeed}
                    onChange={handleChange}
                    min="30"
                    max="70"
                    step="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kích thước khoang chứa *</label>
                  <input
                    type="text"
                    name="cargoCompartmentSize"
                    value={formData.cargoCompartmentSize}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Thêm Drone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedDrone && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="drone-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDrone.name}</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <div className="drone-status-large">
                  <div className="drone-icon-large" style={{ borderColor: getStatusColor(selectedDrone.status) }}>
                    <span>🚁</span>
                  </div>
                  <span className={`status-badge-large ${selectedDrone.status}`}>
                    {getStatusText(selectedDrone.status)}
                  </span>
                </div>

                <div className="battery-section">
                  <h3>Pin hiện tại</h3>
                  <div className="battery-large">
                    <div className="battery-fill-large" style={{ width: `${selectedDrone.battery}%` }}>
                      <span className="battery-text">{selectedDrone.battery}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin kỹ thuật</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">ID Drone:</span>
                    <span className="info-value">{selectedDrone.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Model:</span>
                    <span className="info-value">{selectedDrone.model}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tải trọng tối đa:</span>
                    <span className="info-value">{selectedDrone.maxWeight} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tầm bay tối đa:</span>
                    <span className="info-value">{selectedDrone.maxDistance} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tốc độ TB:</span>
                    <span className="info-value">{selectedDrone.averageSpeed} km/h</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vị trí hiện tại:</span>
                    <span className="info-value">{selectedDrone.location}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thống kê hoạt động</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-number-large">{selectedDrone.totalFlights}</span>
                    <span className="stat-label-large">Tổng chuyến bay</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number-large">{selectedDrone.totalDistance}</span>
                    <span className="stat-label-large">Tổng quãng đường (km)</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Bảo trì</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Bảo trì lần cuối:</span>
                    <span className="info-value">{selectedDrone.lastMaintenance}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bảo trì tiếp theo:</span>
                    <span className="info-value">{selectedDrone.nextMaintenance}</span>
                  </div>
                </div>
              </div>

              {selectedDrone.currentOrder && (
                <div className="detail-section current-order-section">
                  <h3>Đơn hàng hiện tại</h3>
                  <div className="current-order-info">
                    <span className="order-badge">Đơn hàng #{selectedDrone.currentOrder}</span>
                  </div>
                </div>
              )}

              <div className="detail-actions">
                {selectedDrone.status === 'available' && (
                  <button 
                    onClick={() => updateDroneStatus(selectedDrone.id, 'charging')}
                    className="action-btn charging-btn"
                  >
                    Bắt đầu sạc
                  </button>
                )}
                {selectedDrone.status === 'charging' && selectedDrone.battery >= 90 && (
                  <button 
                    onClick={() => updateDroneStatus(selectedDrone.id, 'available')}
                    className="action-btn available-btn"
                  >
                    Đã sạc xong
                  </button>
                )}
                {(selectedDrone.status === 'available' || selectedDrone.status === 'charging') && (
                  <button 
                    onClick={() => updateDroneStatus(selectedDrone.id, 'maintenance')}
                    className="action-btn maintenance-btn"
                  >
                    Bảo trì
                  </button>
                )}
                {selectedDrone.status === 'maintenance' && (
                  <button 
                    onClick={() => updateDroneStatus(selectedDrone.id, 'available')}
                    className="action-btn available-btn"
                  >
                    Hoàn thành bảo trì
                  </button>
                )}
                <button 
                  onClick={() => deleteDrone(selectedDrone.id)}
                  className="action-btn delete-btn"
                >
                  Xóa Drone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Drones
