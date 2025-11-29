import { useState, useEffect } from 'react';
import axios from 'axios';
import './DroneManagement.css';

const API_URL = 'http://localhost:5000/api';

const DroneManagement = () => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [newDrone, setNewDrone] = useState({
    droneId: '',
    name: '',
    model: '',
    restaurant: '',
    maxWeight: 5000,
    maxDistance: 10000,
    specifications: {
      flightTime: 30,
      speed: 50,
      manufacturer: ''
    }
  });

  useEffect(() => {
    fetchDrones();
    fetchRestaurants();
  }, []);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/drones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDrones(response.data.data);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu drone');
      console.error('Error fetching drones:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': '#27ae60',
      'busy': '#f39c12',
      'delivering': '#3498db',
      'returning': '#9b59b6',
      'charging': '#e67e22',
      'maintenance': '#e74c3c',
      'offline': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const texts = {
      'available': 'Sẵn sàng',
      'busy': 'Đang bận',
      'delivering': 'Đang giao',
      'returning': 'Đang về',
      'charging': 'Đang sạc',
      'maintenance': 'Bảo trì',
      'offline': 'Offline'
    };
    return texts[status] || status;
  };

  const getBatteryIcon = (level) => {
    if (level >= 80) return 'battery_full';
    if (level >= 60) return 'battery_6_bar';
    if (level >= 40) return 'battery_4_bar';
    if (level >= 20) return 'battery_2_bar';
    return 'battery_alert';
  };

  const getBatteryColor = (level) => {
    if (level >= 60) return '#27ae60';
    if (level >= 30) return '#f39c12';
    return '#e74c3c';
  };

  const filterDrones = () => {
    if (activeTab === 'all') return drones;
    if (activeTab === 'active') return drones.filter(d => ['available', 'delivering', 'returning'].includes(d.status));
    if (activeTab === 'charging') return drones.filter(d => d.status === 'charging');
    if (activeTab === 'maintenance') return drones.filter(d => d.status === 'maintenance' || d.status === 'offline');
    return drones;
  };

  const handleViewDetail = async (drone) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/drones/${drone._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedDrone(response.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching drone detail:', err);
      setSelectedDrone(drone);
      setShowDetailModal(true);
    }
  };

  const handleUpdateStatus = async (droneId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.patch(`${API_URL}/drones/${droneId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchDrones();
    } catch (err) {
      console.error('Error updating drone status:', err);
      alert('Không thể cập nhật trạng thái drone');
    }
  };

  const handleDeleteDrone = async (droneId) => {
    if (!confirm('Bạn có chắc muốn xóa drone này?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/drones/${droneId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDrones();
      setShowDetailModal(false);
    } catch (err) {
      console.error('Error deleting drone:', err);
      alert('Không thể xóa drone');
    }
  };

  const handleAddDrone = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_URL}/drones`, newDrone, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDrones();
      setShowAddModal(false);
      setNewDrone({
        droneId: '',
        name: '',
        model: '',
        restaurant: '',
        maxWeight: 5000,
        maxDistance: 10000,
        specifications: {
          flightTime: 30,
          speed: 50,
          manufacturer: ''
        }
      });
    } catch (err) {
      console.error('Error adding drone:', err);
      alert('Không thể thêm drone: ' + (err.response?.data?.message || err.message));
    }
  };

  const stats = {
    total: drones.length,
    available: drones.filter(d => d.status === 'available').length,
    delivering: drones.filter(d => d.status === 'delivering').length,
    charging: drones.filter(d => d.status === 'charging').length,
    maintenance: drones.filter(d => d.status === 'maintenance' || d.status === 'offline').length
  };

  if (loading) {
    return (
      <div className="drone-management">
        <div className="loading-container">
          <span className="material-icons spinning">sync</span>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="drone-management">
        <div className="error-container">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
          <button onClick={fetchDrones}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="drone-management">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <span className="material-icons">flight</span>
            Quản lý Drone
          </h1>
          <p className="subtitle">Giám sát và quản lý đội drone giao hàng</p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <span className="material-icons">add</span>
          Thêm Drone
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <span className="material-icons">flight</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng Drone</span>
          </div>
        </div>
        
        <div className="stat-card available">
          <div className="stat-icon">
            <span className="material-icons">check_circle</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.available}</span>
            <span className="stat-label">Sẵn sàng</span>
          </div>
        </div>
        
        <div className="stat-card delivering">
          <div className="stat-icon">
            <span className="material-icons">local_shipping</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.delivering}</span>
            <span className="stat-label">Đang giao</span>
          </div>
        </div>
        
        <div className="stat-card charging">
          <div className="stat-icon">
            <span className="material-icons">battery_charging_full</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.charging}</span>
            <span className="stat-label">Đang sạc</span>
          </div>
        </div>
        
        <div className="stat-card maintenance">
          <div className="stat-icon">
            <span className="material-icons">build</span>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.maintenance}</span>
            <span className="stat-label">Bảo trì</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="material-icons">list</span>
          Tất cả ({drones.length})
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="material-icons">play_circle</span>
          Hoạt động ({stats.available + stats.delivering})
        </button>
        <button 
          className={`tab ${activeTab === 'charging' ? 'active' : ''}`}
          onClick={() => setActiveTab('charging')}
        >
          <span className="material-icons">battery_charging_full</span>
          Đang sạc ({stats.charging})
        </button>
        <button 
          className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <span className="material-icons">build</span>
          Bảo trì ({stats.maintenance})
        </button>
      </div>

      {/* Drone Grid */}
      <div className="drone-grid">
        {filterDrones().length === 0 ? (
          <div className="no-data">
            <span className="material-icons">flight_takeoff</span>
            <p>Không có drone nào trong danh mục này</p>
          </div>
        ) : (
          filterDrones().map(drone => (
            <div key={drone._id} className="drone-card">
              <div className="drone-header">
                <div className="drone-icon">
                  <span className="material-icons">flight</span>
                </div>
                <div className="drone-title">
                  <h3>{drone.name}</h3>
                  <span className="drone-id">{drone.droneId}</span>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(drone.status) }}
                >
                  {getStatusText(drone.status)}
                </span>
              </div>

              <div className="drone-body">
                <div className="info-row">
                  <span className="material-icons">precision_manufacturing</span>
                  <span>{drone.model}</span>
                </div>
                
                <div className="info-row">
                  <span className="material-icons">store</span>
                  <span>{drone.restaurant?.name || 'N/A'}</span>
                </div>

                <div className="battery-row">
                  <span 
                    className="material-icons"
                    style={{ color: getBatteryColor(drone.batteryLevel) }}
                  >
                    {getBatteryIcon(drone.batteryLevel)}
                  </span>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill"
                      style={{ 
                        width: `${drone.batteryLevel}%`,
                        backgroundColor: getBatteryColor(drone.batteryLevel)
                      }}
                    ></div>
                  </div>
                  <span className="battery-text">{drone.batteryLevel}%</span>
                </div>

                <div className="stats-row">
                  <div className="mini-stat">
                    <span className="material-icons">local_shipping</span>
                    <span>{drone.statistics?.totalDeliveries || 0}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="material-icons">schedule</span>
                    <span>{drone.statistics?.totalFlightTime || 0}p</span>
                  </div>
                  <div className="mini-stat">
                    <span className="material-icons">straighten</span>
                    <span>{drone.statistics?.totalDistance || 0}km</span>
                  </div>
                </div>
              </div>

              <div className="drone-actions">
                <button className="btn-view" onClick={() => handleViewDetail(drone)}>
                  Chi tiết
                </button>
                <div className="action-dropdown">
                  <select 
                    value={drone.status}
                    onChange={(e) => handleUpdateStatus(drone._id, e.target.value)}
                  >
                    <option value="available">Sẵn sàng</option>
                    <option value="busy">Đang bận</option>
                    <option value="delivering">Đang giao</option>
                    <option value="charging">Đang sạc</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDrone && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="material-icons">flight</span>
                Chi tiết Drone
              </h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Thông tin cơ bản</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Mã Drone</label>
                    <span>{selectedDrone.droneId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên</label>
                    <span>{selectedDrone.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Model</label>
                    <span>{selectedDrone.model}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nhà hàng</label>
                    <span>{selectedDrone.restaurant?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedDrone.status) }}
                    >
                      {getStatusText(selectedDrone.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Pin</label>
                    <span style={{ color: getBatteryColor(selectedDrone.batteryLevel) }}>
                      {selectedDrone.batteryLevel}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông số kỹ thuật</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tải trọng tối đa</label>
                    <span>{(selectedDrone.maxWeight / 1000).toFixed(1)} kg</span>
                  </div>
                  <div className="detail-item">
                    <label>Khoảng cách tối đa</label>
                    <span>{(selectedDrone.maxDistance / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian bay</label>
                    <span>{selectedDrone.specifications?.flightTime || 'N/A'} phút</span>
                  </div>
                  <div className="detail-item">
                    <label>Tốc độ</label>
                    <span>{selectedDrone.specifications?.speed || 'N/A'} km/h</span>
                  </div>
                  <div className="detail-item">
                    <label>Nhà sản xuất</label>
                    <span>{selectedDrone.specifications?.manufacturer || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thống kê</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tổng giao hàng</label>
                    <span>{selectedDrone.statistics?.totalDeliveries || 0} đơn</span>
                  </div>
                  <div className="detail-item">
                    <label>Tổng thời gian bay</label>
                    <span>{selectedDrone.statistics?.totalFlightTime || 0} phút</span>
                  </div>
                  <div className="detail-item">
                    <label>Tổng quãng đường</label>
                    <span>{selectedDrone.statistics?.totalDistance || 0} km</span>
                  </div>
                </div>
              </div>

              {selectedDrone.currentLocation && (
                <div className="detail-section">
                  <h3>Vị trí hiện tại</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tọa độ</label>
                      <span>
                        {selectedDrone.currentLocation.lat?.toFixed(6)}, 
                        {selectedDrone.currentLocation.lng?.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-delete"
                onClick={() => handleDeleteDrone(selectedDrone._id)}
              >
                <span className="material-icons">delete</span>
                Xóa Drone
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Drone Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content add-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="material-icons">add_circle</span>
                Thêm Drone mới
              </h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleAddDrone}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mã Drone *</label>
                  <input
                    type="text"
                    value={newDrone.droneId}
                    onChange={e => setNewDrone({...newDrone, droneId: e.target.value.toUpperCase()})}
                    placeholder="VD: DRONE-006"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tên Drone *</label>
                  <input
                    type="text"
                    value={newDrone.name}
                    onChange={e => setNewDrone({...newDrone, name: e.target.value})}
                    placeholder="VD: Falcon Express 6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    value={newDrone.model}
                    onChange={e => setNewDrone({...newDrone, model: e.target.value})}
                    placeholder="VD: DJI Mavic 3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nhà hàng *</label>
                  <select
                    value={newDrone.restaurant}
                    onChange={e => setNewDrone({...newDrone, restaurant: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn nhà hàng --</option>
                    {restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tải trọng tối đa (gram)</label>
                    <input
                      type="number"
                      value={newDrone.maxWeight}
                      onChange={e => setNewDrone({...newDrone, maxWeight: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Khoảng cách tối đa (m)</label>
                    <input
                      type="number"
                      value={newDrone.maxDistance}
                      onChange={e => setNewDrone({...newDrone, maxDistance: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thời gian bay (phút)</label>
                    <input
                      type="number"
                      value={newDrone.specifications.flightTime}
                      onChange={e => setNewDrone({
                        ...newDrone, 
                        specifications: {...newDrone.specifications, flightTime: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tốc độ (km/h)</label>
                    <input
                      type="number"
                      value={newDrone.specifications.speed}
                      onChange={e => setNewDrone({
                        ...newDrone, 
                        specifications: {...newDrone.specifications, speed: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nhà sản xuất</label>
                  <input
                    type="text"
                    value={newDrone.specifications.manufacturer}
                    onChange={e => setNewDrone({
                      ...newDrone, 
                      specifications: {...newDrone.specifications, manufacturer: e.target.value}
                    })}
                    placeholder="VD: DJI, Autel, Skydio..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  <span className="material-icons">add</span>
                  Thêm Drone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneManagement;
