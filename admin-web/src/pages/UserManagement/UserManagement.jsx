import { useState } from "react";
import "./UserManagement.css";

function UserManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [users] = useState([
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      status: "active",
      orders: 45,
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0912345678",
      status: "active",
      orders: 32,
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0923456789",
      status: "inactive",
      orders: 15,
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
    },
    {
      id: "4",
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0934567890",
      status: "active",
      orders: 28,
      restaurantId: 2,
      restaurantName: "Bún Bò Huế 24H",
    },
    {
      id: "5",
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      phone: "0945678901",
      status: "active",
      orders: 52,
      restaurantId: 3,
      restaurantName: "KFC Hồ Chí Minh",
    },
    {
      id: "6",
      name: "Võ Thị F",
      email: "vothif@email.com",
      phone: "0956789012",
      status: "active",
      orders: 18,
      restaurantId: 1,
      restaurantName: "Cơm Tấm Sài Gòn",
    },
  ]);

  const [restaurants] = useState([
    { id: 1, name: "Cơm Tấm Sài Gòn" },
    { id: 2, name: "Bún Bò Huế 24H" },
    { id: 3, name: "KFC Hồ Chí Minh" },
  ]);

  let filteredUsers =
    selectedRestaurant === "all"
      ? users
      : users.filter((u) => u.restaurantId === parseInt(selectedRestaurant));

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
    );
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Khách hàng</h1>
          <p className="page-description">
            Quản lý khách hàng của các nhà hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-section">
          <label>Lọc theo nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="restaurant-select"
          >
            <option value="all">Tất cả nhà hàng ({users.length})</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({users.filter((u) => u.restaurantId === r.id).length})
              </option>
            ))}
          </select>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và tên</th>
              <th>Nhà hàng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Số đơn hàng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>#{user.id}</strong>
                </td>
                <td>
                  <strong>{user.name}</strong>
                </td>
                <td>{user.restaurantName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className="order-badge">{user.orders}</span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === "active"
                      ? "✅ Hoạt động"
                      : "❌ Không hoạt động"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view">👁 Xem</button>
                    <button className="action-btn edit">✏️ Sửa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3>Tổng khách hàng</h3>
          <div className="summary-number">{filteredUsers.length}</div>
        </div>
        <div className="summary-card">
          <h3>Đang hoạt động</h3>
          <div className="summary-number active">
            {filteredUsers.filter((u) => u.status === "active").length}
          </div>
        </div>
        <div className="summary-card">
          <h3>Tổng đơn hàng</h3>
          <div className="summary-number orders">
            {filteredUsers.reduce((sum, u) => sum + u.orders, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
