import { useState } from "react";
import "./StaffManagement.css";

function StaffManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0901234567",
      position: "Quản lý",
      salary: 15000000,
      status: "active",
      joinedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0912345678",
      position: "Nhân viên bếp",
      salary: 10000000,
      status: "active",
      joinedDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0923456789",
      position: "Phục vụ",
      salary: 8000000,
      status: "active",
      joinedDate: "2024-03-10",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0934567890",
      position: "Quản lý",
      salary: 14000000,
      status: "active",
      joinedDate: "2024-01-20",
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0945678901",
      position: "Nhân viên bếp",
      salary: 9500000,
      status: "active",
      joinedDate: "2024-02-15",
    },
    {
      id: 6,
      name: "Võ Thị F",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      phone: "0956789012",
      position: "Thu ngân",
      salary: 9000000,
      status: "inactive",
      joinedDate: "2024-05-20",
    },
    {
      id: 7,
      name: "Nguyễn Thị G",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0967890123",
      position: "Thu ngân",
      salary: 8500000,
      status: "active",
      joinedDate: "2024-03-15",
    },
    {
      id: 8,
      name: "Trần Văn H",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      phone: "0978901234",
      position: "Phục vụ",
      salary: 7500000,
      status: "active",
      joinedDate: "2024-04-10",
    },
  ]);

  const [restaurants] = useState([
    { id: 1, name: "Cơm Tấm Sài Gòn" },
    { id: 2, name: "Bún Bò Huế 24H" },
    { id: 3, name: "KFC Hồ Chí Minh" },
  ]);

  const getStatusText = (status) => {
    return status === "active" ? "✅ Đang làm" : "❌ Nghỉ việc";
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  let filteredStaff =
    selectedRestaurant === "all"
      ? staff
      : staff.filter((s) => s.restaurantId === parseInt(selectedRestaurant));

  // Apply search filter
  if (searchTerm) {
    filteredStaff = filteredStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Calculate stats based on filtered staff
  const activeFilteredStaff = filteredStaff.filter(
    (s) => s.status === "active"
  );
  const totalSalary = activeFilteredStaff.reduce((sum, s) => sum + s.salary, 0);

  const handleDeactivate = (id) => {
    setStaff(
      staff.map((s) => (s.id === id ? { ...s, status: "inactive" } : s))
    );
    alert("Đã cho nhân viên nghỉ việc!");
  };

  const handleActivate = (id) => {
    setStaff(staff.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
    alert("Đã kích hoạt lại nhân viên!");
  };

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowViewModal(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setStaff(staff.map((s) => (s.id === selectedStaff.id ? selectedStaff : s)));
    setShowEditModal(false);
    alert("Đã cập nhật thông tin nhân viên!");
  };

  return (
    <div className="staff-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Nhân viên</h1>
          <p className="page-description">
            Quản lý nhân viên của các nhà hàng trong hệ thống
          </p>
        </div>
        <button className="add-btn">+ Thêm nhân viên</button>
      </div>

      <div className="filter-bar">
        <div className="filter-section">
          <label>Lọc theo nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="restaurant-select"
          >
            <option value="all">Tất cả nhà hàng ({staff.length})</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({staff.filter((s) => s.restaurantId === r.id).length})
              </option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="staff-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và tên</th>
              <th>Nhà hàng</th>
              <th>Số điện thoại</th>
              <th>Chức vụ</th>
              <th>Lương</th>
              <th>Ngày vào làm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id}>
                <td>
                  <strong>#{member.id}</strong>
                </td>
                <td>
                  <strong>{member.name}</strong>
                </td>
                <td>{member.restaurantName}</td>
                <td>{member.phone}</td>
                <td>
                  <span className="position-badge">{member.position}</span>
                </td>
                <td className="salary-cell">
                  {member.salary.toLocaleString("vi-VN")}đ
                </td>
                <td>
                  {new Date(member.joinedDate).toLocaleDateString("vi-VN")}
                </td>
                <td>
                  <span className={getStatusClass(member.status)}>
                    {getStatusText(member.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleView(member)}
                    >
                      👁 Xem
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(member)}
                    >
                      ✏️ Sửa
                    </button>
                    {member.status === "active" ? (
                      <button
                        className="action-btn deactivate"
                        onClick={() => handleDeactivate(member.id)}
                      >
                        🔒 Cho nghỉ
                      </button>
                    ) : (
                      <button
                        className="action-btn activate"
                        onClick={() => handleActivate(member.id)}
                      >
                        🔓 Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3>Tổng nhân viên</h3>
          <div className="summary-number">{filteredStaff.length}</div>
        </div>
        <div className="summary-card">
          <h3>Đang làm việc</h3>
          <div className="summary-number active">
            {activeFilteredStaff.length}
          </div>
        </div>
        <div className="summary-card">
          <h3>Tổng lương/tháng</h3>
          <div className="summary-number salary">
            {(totalSalary / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Modal Xem Chi tiết */}
      {showViewModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin Nhân viên</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="info-row">
                <label>Họ và tên:</label>
                <span>{selectedStaff.name}</span>
              </div>
              <div className="info-row">
                <label>Nhà hàng:</label>
                <span>{selectedStaff.restaurantName}</span>
              </div>
              <div className="info-row">
                <label>Số điện thoại:</label>
                <span>{selectedStaff.phone}</span>
              </div>
              <div className="info-row">
                <label>Chức vụ:</label>
                <span>{selectedStaff.position}</span>
              </div>
              <div className="info-row">
                <label>Lương:</label>
                <span>{selectedStaff.salary.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="info-row">
                <label>Ngày vào làm:</label>
                <span>
                  {new Date(selectedStaff.joinedDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
              <div className="info-row">
                <label>Trạng thái:</label>
                <span className={`status-badge ${selectedStaff.status}`}>
                  {selectedStaff.status === "active"
                    ? "✅ Đang làm"
                    : "❌ Nghỉ việc"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {showEditModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa Nhân viên</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Họ và tên:</label>
                <input
                  type="text"
                  value={selectedStaff.name}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại:</label>
                <input
                  type="text"
                  value={selectedStaff.phone}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Chức vụ:</label>
                <select
                  value={selectedStaff.position}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      position: e.target.value,
                    })
                  }
                >
                  <option value="Quản lý">Quản lý</option>
                  <option value="Nhân viên bếp">Nhân viên bếp</option>
                  <option value="Phục vụ">Phục vụ</option>
                  <option value="Thu ngân">Thu ngân</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lương:</label>
                <input
                  type="number"
                  value={selectedStaff.salary}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      salary: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button className="save-btn" onClick={handleSaveEdit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
