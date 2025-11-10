import { useState } from 'react'
import './DroneManagement.css'

function DroneManagement() {
  const [drones] = useState([
    { id: 'DR-001', model: 'DJI Delivery X1', status: 'delivering', battery: 75, location: 'Q.1, TP.HCM', orders: 145 },
    { id: 'DR-002', model: 'DJI Delivery X1', status: 'available', battery: 95, location: 'Depot A', orders: 132 },
    { id: 'DR-003', model: 'DJI Delivery X2', status: 'charging', battery: 30, location: 'Depot B', orders: 98 },
    { id: 'DR-004', model: 'DJI Delivery X1', status: 'maintenance', battery: 0, location: 'Service Center', orders: 156 },
  ])

  return (
    <div className="drone-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Drone</h1>
          <p className="subtitle">Tổng số drone: {drones.length}</p>
        </div>
        <button className="add-btn">+ Thêm drone</button>
      </div>

      <div className="drones-grid">
        {drones.map(drone => (
          <div key={drone.id} className="drone-card">
            <div className="drone-header">
              <h3>🚁 {drone.id}</h3>
              <span className={`status-badge ${drone.status}`}>
                {drone.status === 'delivering' && '🚁 Đang giao hàng'}
                {drone.status === 'available' && '✅ Sẵn sàng'}
                {drone.status === 'charging' && '🔋 Đang sạc'}
                {drone.status === 'maintenance' && '🔧 Bảo trì'}
              </span>
            </div>
            
            <p className="drone-model">{drone.model}</p>
            
            <div className="drone-info">
              <div className="info-row">
                <span>Pin:</span>
                <span className={`battery ${drone.battery < 30 ? 'low' : ''}`}>
                  {drone.battery}%
                </span>
              </div>
              <div className="info-row">
                <span>Vị trí:</span>
                <span>{drone.location}</span>
              </div>
              <div className="info-row">
                <span>Đơn đã giao:</span>
                <span>{drone.orders}</span>
              </div>
            </div>

            <div className="drone-actions">
              <button className="track-btn">Theo dõi</button>
              <button className="manage-btn">Quản lý</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DroneManagement
