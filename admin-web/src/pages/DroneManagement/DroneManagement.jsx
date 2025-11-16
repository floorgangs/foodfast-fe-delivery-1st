import { useState } from "react";
import "./DroneManagement.css";

function DroneManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);

  const [drones, setDrones] = useState([
    {
      id: "DR001",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      registrationDate: "2024-01-15",
      model: "DJI Mavic Pro",
      status: "active",
      condition: "good",
      batteryLevel: 85,
      flightCount: 145,
      lastMaintenance: "2024-10-20",
      maxWeight: 2.5,
      maxDistance: 5,
      currentLocation: "Tại kho",
      approvalStatus: "approved",
    },
    {
      id: "DR002",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      registrationDate: "2024-02-10",
      model: "DJI Mini 3",
      status: "delivering",
      condition: "good",
      batteryLevel: 42,
      flightCount: 89,
      lastMaintenance: "2024-11-01",
      maxWeight: 1.5,
      maxDistance: 3,
      currentLocation: "Đang giao đơn #FF10234",
      approvalStatus: "approved",
    },
    {
      id: "DR003",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      registrationDate: "2024-03-05",
      model: "DJI Air 2S",
      status: "charging",
      condition: "good",
      batteryLevel: 15,
      flightCount: 67,
      lastMaintenance: "2024-10-15",
      maxWeight: 2.0,
      maxDistance: 4,
      currentLocation: "Đang sạc",
      approvalStatus: "approved",
    },
    {
      id: "DR004",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      registrationDate: "2024-01-20",
      model: "DJI Mavic Pro",
      status: "active",
      condition: "excellent",
      batteryLevel: 92,
      flightCount: 203,
      lastMaintenance: "2024-10-25",
      maxWeight: 2.5,
      maxDistance: 5,
      currentLocation: "Tại kho",
      approvalStatus: "approved",
    },
    {
      id: "DR005",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      registrationDate: "2024-02-15",
      model: "DJI Mini 2",
      status: "maintenance",
      condition: "fair",
      batteryLevel: 0,
      flightCount: 178,
      lastMaintenance: "2024-08-10",
      maxWeight: 1.2,
      maxDistance: 3,
      currentLocation: "Đang bảo trì",
      approvalStatus: "approved",
    },
    {
      id: "DR006",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      registrationDate: "2024-11-10",
      model: "DJI Phantom 4",
      status: "pending",
      condition: "excellent",
      batteryLevel: 100,
      flightCount: 0,
      lastMaintenance: "2024-11-10",
      maxWeight: 3.0,
      maxDistance: 7,
      currentLocation: "Chờ xác nhận",
      approvalStatus: "pending",
    },
    {
      id: "DR007",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      registrationDate: "2024-11-12",
      model: "DJI Inspire 2",
      status: "pending",
      condition: "excellent",
      batteryLevel: 100,
      flightCount: 0,
      lastMaintenance: "2024-11-12",
      maxWeight: 4.0,
      maxDistance: 10,
      currentLocation: "Chờ xác nhận",
      approvalStatus: "pending",
    },
  ]);

  const [restaurants] = useState([
    { id: 1, name: "Cơm Tấm Sài Gòn" },
    { id: 2, name: "Bún Bò Huế 24H" },
    { id: 3, name: "KFC Hồ Chí Minh" },
  ]);

  const getStatusText = (status) => {
    const statusMap = {
      active: "🟢 Sẵn sàng",
      delivering: "🚁 Đang giao",
      charging: "🔋 Đang sạc",
      maintenance: "🔧 Bảo trì",
      pending: "⏳ Chờ duyệt",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const getConditionText = (condition) => {
    const conditionMap = {
      excellent: "⭐ Tuyệt vời",
      good: "✅ Tốt",
      fair: "⚠️ Khá",
      poor: "❌ Kém",
    };
    return conditionMap[condition] || condition;
  };

  const getConditionClass = (condition) => {
    return `condition-badge ${condition}`;
  };

  let filteredDrones =
    selectedRestaurant === "all"
      ? drones
      : drones.filter((d) => d.restaurantId === parseInt(selectedRestaurant));

  // Apply tab filter
  if (activeTab === "active") {
    filteredDrones = filteredDrones.filter((d) =>
      ["active", "delivering", "charging"].includes(d.status)
    );
  } else if (activeTab === "maintenance") {
    filteredDrones = filteredDrones.filter((d) => d.status === "maintenance");
  } else if (activeTab === "pending") {
    filteredDrones = filteredDrones.filter(
      (d) => d.approvalStatus === "pending"
    );
  }

  const handleApprove = (droneId) => {
    setDrones(
      drones.map((d) =>
        d.id === droneId
          ? {
              ...d,
              approvalStatus: "approved",
              status: "active",
              currentLocation: "Tại kho",
            }
          : d
      )
    );
    alert("Đã xác nhận drone!");
  };

  const handleReject = (droneId) => {
    if (confirm("Bạn có chắc muốn từ chối drone này?")) {
      setDrones(drones.filter((d) => d.id !== droneId));
      alert("Đã từ chối drone!");
    }
  };

  const handleDroneClick = (drone) => {
    setSelectedDrone(drone);
    setShowDetailModal(true);
  };

  return (
    <div className="drone-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Drone</h1>
          <p className="page-description">
            Quản lý drone giao hàng của các nhà hàng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filter theo nhà hàng */}
      <div className="filter-bar">
        <div className="filter-section">
          <label>Lọc theo nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="restaurant-select"
          >
            <option value="all">Tất cả nhà hàng ({drones.length})</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({drones.filter((d) => d.restaurantId === r.id).length}
                )
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="drone-tabs">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Đang hoạt động
          <span className="tab-count">
            {
              drones.filter(
                (d) =>
                  (selectedRestaurant === "all" ||
                    d.restaurantId === parseInt(selectedRestaurant)) &&
                  ["active", "delivering", "charging"].includes(d.status)
              ).length
            }
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "maintenance" ? "active" : ""}`}
          onClick={() => setActiveTab("maintenance")}
        >
          Bảo trì
          <span className="tab-count">
            {
              drones.filter(
                (d) =>
                  (selectedRestaurant === "all" ||
                    d.restaurantId === parseInt(selectedRestaurant)) &&
                  d.status === "maintenance"
              ).length
            }
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Chờ xác nhận
          <span className="tab-count">
            {
              drones.filter(
                (d) =>
                  (selectedRestaurant === "all" ||
                    d.restaurantId === parseInt(selectedRestaurant)) &&
                  d.approvalStatus === "pending"
              ).length
            }
          </span>
        </button>
      </div>

      {/* Danh sách Drone */}
      <div className="drones-list">
        {filteredDrones.length === 0 ? (
          <div className="empty-state">
            <p>Không có drone nào</p>
          </div>
        ) : (
          filteredDrones.map((drone) => (
            <div
              key={drone.id}
              className="drone-card"
              onClick={() => handleDroneClick(drone)}
            >
              <div className="drone-header">
                <div className="drone-info">
                  <span className="drone-id">🚁 {drone.id}</span>
                  <span className="drone-model">{drone.model}</span>
                </div>
                <div className="drone-status">
                  <span className={getStatusClass(drone.status)}>
                    {getStatusText(drone.status)}
                  </span>
                </div>
              </div>

              <div className="drone-body">
                <div className="info-row">
                  <span className="label">🏪 Nhà hàng:</span>
                  <span className="value">{drone.restaurantName}</span>
                </div>
                <div className="info-row">
                  <span className="label">📍 Vị trí:</span>
                  <span className="value">{drone.currentLocation}</span>
                </div>
                <div className="info-row">
                  <span className="label">🔋 Pin:</span>
                  <span className="value">
                    <div className="battery-bar">
                      <div
                        className="battery-fill"
                        style={{
                          width: `${drone.batteryLevel}%`,
                          backgroundColor:
                            drone.batteryLevel > 50
                              ? "#10b981"
                              : drone.batteryLevel > 20
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                    {drone.batteryLevel}%
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">✈️ Chuyến bay:</span>
                  <span className="value">{drone.flightCount} chuyến</span>
                </div>
                <div className="info-row">
                  <span className="label">🎯 Tình trạng:</span>
                  <span className={getConditionClass(drone.condition)}>
                    {getConditionText(drone.condition)}
                  </span>
                </div>
              </div>

              {drone.approvalStatus === "pending" && (
                <div className="drone-actions">
                  <button
                    className="approve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(drone.id);
                    }}
                  >
                    ✅ Xác nhận
                  </button>
                  <button
                    className="reject-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(drone.id);
                    }}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>Tổng Drone</h3>
          <div className="summary-number">{filteredDrones.length}</div>
        </div>
        <div className="summary-card">
          <h3>Đang hoạt động</h3>
          <div className="summary-number active">
            {
              filteredDrones.filter((d) =>
                ["active", "delivering"].includes(d.status)
              ).length
            }
          </div>
        </div>
        <div className="summary-card">
          <h3>Chờ xác nhận</h3>
          <div className="summary-number pending">
            {
              filteredDrones.filter((d) => d.approvalStatus === "pending")
                .length
            }
          </div>
        </div>
      </div>

      {/* Modal Chi tiết */}
      {showDetailModal && selectedDrone && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết Drone {selectedDrone.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-row">
                  <label>Mã Drone:</label>
                  <span>{selectedDrone.id}</span>
                </div>
                <div className="info-row">
                  <label>Model:</label>
                  <span>{selectedDrone.model}</span>
                </div>
                <div className="info-row">
                  <label>Nhà hàng:</label>
                  <span>{selectedDrone.restaurantName}</span>
                </div>
                <div className="info-row">
                  <label>Ngày đăng ký:</label>
                  <span>
                    {new Date(
                      selectedDrone.registrationDate
                    ).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Trạng thái hiện tại</h3>
                <div className="info-row">
                  <label>Tình trạng:</label>
                  <span className={getStatusClass(selectedDrone.status)}>
                    {getStatusText(selectedDrone.status)}
                  </span>
                </div>
                <div className="info-row">
                  <label>Vị trí:</label>
                  <span>{selectedDrone.currentLocation}</span>
                </div>
                <div className="info-row">
                  <label>Pin:</label>
                  <span>{selectedDrone.batteryLevel}%</span>
                </div>
                <div className="info-row">
                  <label>Chất lượng:</label>
                  <span className={getConditionClass(selectedDrone.condition)}>
                    {getConditionText(selectedDrone.condition)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông số kỹ thuật</h3>
                <div className="info-row">
                  <label>Tải trọng tối đa:</label>
                  <span>{selectedDrone.maxWeight} kg</span>
                </div>
                <div className="info-row">
                  <label>Khoảng cách tối đa:</label>
                  <span>{selectedDrone.maxDistance} km</span>
                </div>
                <div className="info-row">
                  <label>Tổng chuyến bay:</label>
                  <span>{selectedDrone.flightCount} chuyến</span>
                </div>
                <div className="info-row">
                  <label>Bảo trì lần cuối:</label>
                  <span>
                    {new Date(selectedDrone.lastMaintenance).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DroneManagement;
