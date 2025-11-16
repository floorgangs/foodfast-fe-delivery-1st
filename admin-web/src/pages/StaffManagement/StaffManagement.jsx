import { useState } from "react";
import "./StaffManagement.css";

function StaffManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    restaurantId: 1,
    phone: "",
    email: "",
    position: "Phục vụ",
    salary: 8000000,
    status: "active",
    joinedDate: new Date().toISOString().split("T")[0],
    firstWorkDay: new Date().toISOString().split("T")[0],
    totalWorkDays: 0,
    daysOff: 0,
  });
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0901234567",
      email: "nguyenvana@comtam.com",
      position: "Quản lý",
      salary: 15000000,
      status: "active",
      joinedDate: "2024-01-15",
      firstWorkDay: "2024-01-15",
      totalWorkDays: 306,
      daysOff: 12,
    },
    {
      id: 2,
      name: "Trần Thị B",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0912345678",
      email: "tranthib@comtam.com",
      position: "Nhân viên bếp",
      salary: 10000000,
      status: "active",
      joinedDate: "2024-02-20",
      firstWorkDay: "2024-02-20",
      totalWorkDays: 270,
      daysOff: 8,
    },
    {
      id: 3,
      name: "Lê Văn C",
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
      phone: "0923456789",
      email: "levanc@comtam.com",
      position: "Phục vụ",
      salary: 8000000,
      status: "active",
      joinedDate: "2024-03-10",
      firstWorkDay: "2024-03-10",
      totalWorkDays: 252,
      daysOff: 6,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0934567890",
      email: "phamthid@bunbo.com",
      position: "Quản lý",
      salary: 14000000,
      status: "active",
      joinedDate: "2024-01-20",
      firstWorkDay: "2024-01-20",
      totalWorkDays: 301,
      daysOff: 10,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0945678901",
      email: "hoangvane@bunbo.com",
      position: "Nhân viên bếp",
      salary: 9500000,
      status: "active",
      joinedDate: "2024-02-15",
      firstWorkDay: "2024-02-15",
      totalWorkDays: 275,
      daysOff: 7,
    },
    {
      id: 6,
      name: "Võ Thị F",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      phone: "0956789012",
      email: "vothif@kfc.com",
      position: "Thu ngân",
      salary: 9000000,
      status: "inactive",
      joinedDate: "2024-05-20",
      firstWorkDay: "2024-05-20",
      totalWorkDays: 120,
      daysOff: 15,
    },
    {
      id: 7,
      name: "Nguyễn Thị G",
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
      phone: "0967890123",
      email: "nguyenthig@bunbo.com",
      position: "Thu ngân",
      salary: 8500000,
      status: "active",
      joinedDate: "2024-03-15",
      firstWorkDay: "2024-03-15",
      totalWorkDays: 247,
      daysOff: 5,
    },
    {
      id: 8,
      name: "Trần Văn H",
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
      phone: "0978901234",
      email: "tranvanh@kfc.com",
      position: "Phục vụ",
      salary: 7500000,
      status: "active",
      joinedDate: "2024-04-10",
      firstWorkDay: "2024-04-10",
      totalWorkDays: 221,
      daysOff: 4,
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

  const handleAddStaff = () => {
    const restaurant = restaurants.find((r) => r.id === newStaff.restaurantId);
    const staffWithId = {
      ...newStaff,
      id: staff.length + 1,
      restaurantName: restaurant.name,
    };
    setStaff([...staff, staffWithId]);
    setShowAddModal(false);
    setNewStaff({
      name: "",
      restaurantId: 1,
      phone: "",
      email: "",
      position: "Phục vụ",
      salary: 8000000,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      firstWorkDay: new Date().toISOString().split("T")[0],
      totalWorkDays: 0,
      daysOff: 0,
    });
    alert("Đã thêm nhân viên mới!");
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
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Thêm nhân viên
        </button>
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
              <th>Chức vụ</th>
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
                <td>
                  <span className="position-badge">{member.position}</span>
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
              <div className="info-section">
                <h3>Thông tin cá nhân</h3>
                <div className="info-row">
                  <label>Họ và tên:</label>
                  <span>{selectedStaff.name}</span>
                </div>
                <div className="info-row">
                  <label>Số điện thoại:</label>
                  <span>{selectedStaff.phone}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{selectedStaff.email}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Thông tin công việc</h3>
                <div className="info-row">
                  <label>Nhà hàng:</label>
                  <span>{selectedStaff.restaurantName}</span>
                </div>
                <div className="info-row">
                  <label>Chức vụ:</label>
                  <span className="position-badge">
                    {selectedStaff.position}
                  </span>
                </div>
                <div className="info-row">
                  <label>Lương cơ bản:</label>
                  <span className="salary-value">
                    {selectedStaff.salary.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="info-row">
                  <label>Trạng thái:</label>
                  <span className={getStatusClass(selectedStaff.status)}>
                    {getStatusText(selectedStaff.status)}
                  </span>
                </div>
              </div>

              <div className="info-section">
                <h3>Thông tin làm việc</h3>
                <div className="info-row">
                  <label>Ngày đầu tiên đi làm:</label>
                  <span>
                    {new Date(selectedStaff.firstWorkDay).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <label>Ngày vào làm chính thức:</label>
                  <span>
                    {new Date(selectedStaff.joinedDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <label>Tổng số ngày làm việc:</label>
                  <span className="work-days">
                    {selectedStaff.totalWorkDays} ngày
                  </span>
                </div>
                <div className="info-row">
                  <label>Số ngày nghỉ:</label>
                  <span className="days-off">{selectedStaff.daysOff} ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {showEditModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                <div className="form-group">
                  <label>Họ và tên:</label>
                  <input
                    type="text"
                    value={selectedStaff.name}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        name: e.target.value,
                      })
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
                  <label>Email:</label>
                  <input
                    type="email"
                    value={selectedStaff.email}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin công việc</h3>
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
                  <label>Lương cơ bản (VNĐ):</label>
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
                <div className="form-group">
                  <label>Trạng thái:</label>
                  <select
                    value={selectedStaff.status}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">Đang làm</option>
                    <option value="inactive">Nghỉ việc</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin làm việc</h3>
                <div className="form-group">
                  <label>Ngày đầu tiên đi làm:</label>
                  <input
                    type="date"
                    value={selectedStaff.firstWorkDay}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        firstWorkDay: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ngày vào làm chính thức:</label>
                  <input
                    type="date"
                    value={selectedStaff.joinedDate}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        joinedDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Tổng số ngày làm việc:</label>
                  <input
                    type="number"
                    value={selectedStaff.totalWorkDays}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        totalWorkDays: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Số ngày nghỉ:</label>
                  <input
                    type="number"
                    value={selectedStaff.daysOff}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        daysOff: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
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

      {/* Modal Thêm */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Thêm Nhân viên Mới</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                <div className="form-group">
                  <label>Họ và tên: *</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại: *</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={newStaff.phone}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email: *</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin công việc</h3>
                <div className="form-group">
                  <label>Nhà hàng: *</label>
                  <select
                    value={newStaff.restaurantId}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        restaurantId: parseInt(e.target.value),
                      })
                    }
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Chức vụ: *</label>
                  <select
                    value={newStaff.position}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
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
                  <label>Lương cơ bản (VNĐ): *</label>
                  <input
                    type="number"
                    placeholder="Nhập lương"
                    value={newStaff.salary}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        salary: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái: *</label>
                  <select
                    value={newStaff.status}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">Đang làm</option>
                    <option value="inactive">Nghỉ việc</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin làm việc</h3>
                <div className="form-group">
                  <label>Ngày đầu tiên đi làm: *</label>
                  <input
                    type="date"
                    value={newStaff.firstWorkDay}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        firstWorkDay: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ngày vào làm chính thức: *</label>
                  <input
                    type="date"
                    value={newStaff.joinedDate}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        joinedDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Tổng số ngày làm việc:</label>
                  <input
                    type="number"
                    placeholder="Mặc định 0"
                    value={newStaff.totalWorkDays}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        totalWorkDays: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Số ngày nghỉ:</label>
                  <input
                    type="number"
                    placeholder="Mặc định 0"
                    value={newStaff.daysOff}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        daysOff: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button className="save-btn" onClick={handleAddStaff}>
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
