import { useState } from 'react'
import './MenuManagement.css'

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([
    { id: '101', name: 'Cơm Tấm Sườn Nướng', price: 35000, category: 'main', available: true },
    { id: '102', name: 'Cơm Tấm Sườn Bì Chả', price: 40000, category: 'main', available: true },
    { id: '103', name: 'Cơm Tấm Đặc Biệt', price: 45000, category: 'main', available: false },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'main' })

  const handleAddItem = (e) => {
    e.preventDefault()
    const item = {
      id: Date.now().toString(),
      name: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category,
      available: true
    }
    setMenuItems([...menuItems, item])
    setNewItem({ name: '', price: '', category: 'main' })
    setShowAddForm(false)
  }

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }

  const deleteItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  return (
    <div className="menu-management-page">
      <div className="page-header">
        <h1>Quản lý thực đơn</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
          + Thêm món mới
        </button>
      </div>

      {showAddForm && (
        <form className="add-form" onSubmit={handleAddItem}>
          <h3>Thêm món mới</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Tên món"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Giá"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              required
            />
            <select 
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            >
              <option value="main">Món chính</option>
              <option value="side">Món phụ</option>
              <option value="drink">Đồ uống</option>
            </select>
            <button type="submit">Thêm</button>
          </div>
        </form>
      )}

      <div className="menu-list">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price.toLocaleString('vi-VN')}đ</td>
                <td>
                  {item.category === 'main' && 'Món chính'}
                  {item.category === 'side' && 'Món phụ'}
                  {item.category === 'drink' && 'Đồ uống'}
                </td>
                <td>
                  <span className={`status ${item.available ? 'available' : 'unavailable'}`}>
                    {item.available ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => toggleAvailability(item.id)}
                    className="toggle-btn"
                  >
                    {item.available ? 'Đánh dấu hết' : 'Đánh dấu còn'}
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MenuManagement
