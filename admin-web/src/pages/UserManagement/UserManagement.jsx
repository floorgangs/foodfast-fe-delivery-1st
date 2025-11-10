import { useState } from 'react'
import './UserManagement.css'

function UserManagement() {
  const [users] = useState([
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', status: 'active', orders: 45 },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0912345678', status: 'active', orders: 32 },
    { id: '3', name: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789', status: 'inactive', orders: 15 },
  ])

  return (
    <div className="user-management-page">
      <h1>Quản lý người dùng</h1>
      <p className="subtitle">Tổng số người dùng: {users.length}</p>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Số đơn hàng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.orders}</td>
              <td>
                <span className={`status ${user.status}`}>
                  {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </td>
              <td>
                <button className="view-btn">Xem</button>
                <button className="edit-btn">Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagement
