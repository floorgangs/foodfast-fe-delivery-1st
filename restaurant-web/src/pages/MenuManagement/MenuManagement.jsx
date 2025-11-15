import { useState } from 'react'
import './MenuManagement.css'

function MenuManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [categories, setCategories] = useState([
    { id: 'cat1', name: 'Món chính', itemCount: 8 },
    { id: 'cat2', name: 'Món phụ', itemCount: 5 },
    { id: 'cat3', name: 'Đồ uống', itemCount: 4 },
    { id: 'cat4', name: 'Tráng miệng', itemCount: 3 },
  ])

  const [menuItems, setMenuItems] = useState([
    { 
      id: '101', 
      name: 'Cơm Tấm Sườn Nướng', 
      price: 35000, 
      category: 'Món chính',
      categoryId: 'cat1',
      description: 'Cơm tấm sườn nướng thơm ngon, ăn kèm với dưa leo và cà chua',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
      available: true,
      cookTime: 15,
      discount: 0
    },
    { 
      id: '102', 
      name: 'Cơm Tấm Sườn Bì Chả', 
      price: 40000, 
      category: 'Món chính',
      categoryId: 'cat1',
      description: 'Cơm tấm đầy đủ với sườn nướng, bì và chả',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
      available: true,
      cookTime: 15,
      discount: 10
    },
    { 
      id: '103', 
      name: 'Cơm Tấm Đặc Biệt', 
      price: 45000, 
      category: 'Món chính',
      categoryId: 'cat1',
      description: 'Cơm tấm đặc biệt với đầy đủ topping',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      available: false,
      cookTime: 20,
      discount: 0
    },
    { 
      id: '104', 
      name: 'Bún Bò Huế', 
      price: 38000, 
      category: 'Món chính',
      categoryId: 'cat1',
      description: 'Bún bò Huế chuẩn vị xứ Huế',
      image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400',
      available: true,
      cookTime: 12,
      discount: 0
    },
    { 
      id: '105', 
      name: 'Phở Bò Tái', 
      price: 42000, 
      category: 'Món chính',
      categoryId: 'cat1',
      description: 'Phở bò tái nóng hổi',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      available: true,
      cookTime: 10,
      discount: 0
    },
    { 
      id: '201', 
      name: 'Nem Nướng', 
      price: 15000, 
      category: 'Món phụ',
      categoryId: 'cat2',
      description: 'Nem nướng Nha Trang',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
      available: true,
      cookTime: 5,
      discount: 0
    },
    { 
      id: '202', 
      name: 'Chả Giò', 
      price: 12000, 
      category: 'Món phụ',
      categoryId: 'cat2',
      description: 'Chả giò giòn tan',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      available: true,
      cookTime: 8,
      discount: 0
    },
    { 
      id: '301', 
      name: 'Trà Đá', 
      price: 5000, 
      category: 'Đồ uống',
      categoryId: 'cat3',
      description: 'Trà đá mát lạnh',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      available: true,
      cookTime: 2,
      discount: 0
    },
    { 
      id: '302', 
      name: 'Nước Cam', 
      price: 15000, 
      category: 'Đồ uống',
      categoryId: 'cat3',
      description: 'Nước cam tươi vắt',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      available: true,
      cookTime: 3,
      discount: 0
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: 'cat1',
    description: '',
    image: null,
    cookTime: 10,
    discount: 0,
    saleTime: 'all-day'
  })

  const getFilteredItems = () => {
    let filtered = menuItems
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.categoryId === activeTab)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'image' && files[0]) {
      const imageUrl = URL.createObjectURL(files[0])
      setFormData({
        ...formData,
        [name]: imageUrl
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    const category = categories.find(cat => cat.id === formData.categoryId)
    const newItem = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseInt(formData.price),
      category: category.name,
      categoryId: formData.categoryId,
      description: formData.description,
      image: formData.image,
      available: true,
      cookTime: parseInt(formData.cookTime),
      discount: parseInt(formData.discount)
    }
    setMenuItems([...menuItems, newItem])
    setShowAddModal(false)
    resetForm()
  }

  const handleEditItem = (e) => {
    e.preventDefault()
    const category = categories.find(cat => cat.id === formData.categoryId)
    const updatedItems = menuItems.map(item =>
      item.id === selectedItem.id
        ? {
            ...item,
            name: formData.name,
            price: parseInt(formData.price),
            category: category.name,
            categoryId: formData.categoryId,
            description: formData.description,
            image: formData.image || item.image,
            cookTime: parseInt(formData.cookTime),
            discount: parseInt(formData.discount)
          }
        : item
    )
    setMenuItems(updatedItems)
    setShowEditModal(false)
    setSelectedItem(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      categoryId: 'cat1',
      description: '',
      image: null,
      cookTime: 10,
      discount: 0,
      saleTime: 'all-day'
    })
  }

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ))
  }

  const deleteItem = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món này?')) {
      setMenuItems(menuItems.filter(item => item.id !== id))
    }
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      categoryId: item.categoryId,
      description: item.description,
      image: null,
      cookTime: item.cookTime.toString(),
      discount: item.discount.toString()
    })
    setShowEditModal(true)
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="menu-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý thực đơn</h1>
          <p className="subtitle">Quản lý món ăn và danh mục</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="add-btn">
          + Thêm món mới
        </button>
      </div>

      <div className="menu-stats">
        <div className="stat-card">
          <span className="stat-number">{menuItems.length}</span>
          <span className="stat-label">Tổng số món</span>
        </div>
        <div className="stat-card available">
          <span className="stat-number">{menuItems.filter(i => i.available).length}</span>
          <span className="stat-label">Đang bán</span>
        </div>
        <div className="stat-card unavailable">
          <span className="stat-number">{menuItems.filter(i => !i.available).length}</span>
          <span className="stat-label">Hết hàng</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Danh mục</span>
        </div>
      </div>

      <div className="menu-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
            <span className="tab-count">{menuItems.length}</span>
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.name}
              <span className="tab-count">{menuItems.filter(i => i.categoryId === cat.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-card" onClick={() => {
            setSelectedItem(item)
            setShowDetailModal(true)
          }}>
            <div className="menu-card-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="no-image">
                  <span>🍽️</span>
                </div>
              )}
              {item.discount > 0 && (
                <span className="discount-badge">-{item.discount}%</span>
              )}
            </div>

            <div className="menu-card-content">
              <div className="menu-card-header">
                <h3>{item.name}</h3>
                <div className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                  {item.available ? 'Đang bán' : 'Hết hàng'}
                </div>
              </div>

              <p className="menu-description">{item.description}</p>

              <div className="menu-card-footer">
                <div className="price-section">
                  {item.discount > 0 ? (
                    <>
                      <span className="original-price">{item.price.toLocaleString('vi-VN')}đ</span>
                      <span className="discounted-price">
                        {(item.price * (100 - item.discount) / 100).toLocaleString('vi-VN')}đ
                      </span>
                    </>
                  ) : (
                    <span className="price">{item.price.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>

                <div className="menu-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAvailability(item.id)
                    }}
                    className={`action-btn ${item.available ? 'btn-hide' : 'btn-show'}`}
                  >
                    {item.available ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🍽️</span>
          <h3>Không tìm thấy món ăn</h3>
          <p>Hãy thêm món mới hoặc thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm món mới</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Tên món *</label>
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
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="1000"
                    step="1000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục *</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả món ăn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả chi tiết về món ăn..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian chế biến (phút) *</label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giảm giá (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Thời gian bán *</label>
                <select name="saleTime" value={formData.saleTime} onChange={handleChange}>
                  <option value="all-day">Cả ngày</option>
                  <option value="morning">Sáng (6h-11h)</option>
                  <option value="afternoon">Trưa (11h-14h)</option>
                  <option value="evening">Chiều (14h-18h)</option>
                  <option value="night">Tối (18h-22h)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Hình ảnh món ăn</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Thêm món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa món ăn</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditItem}>
              <div className="form-group">
                <label>Tên món *</label>
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
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="1000"
                    step="1000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục *</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả món ăn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả chi tiết về món ăn..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian chế biến (phút) *</label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giảm giá (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hình ảnh món ăn mới (để trống nếu không đổi)</label>
                <input
                  type="file"
                  name="image"
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

      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết món ăn</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="detail-body">
              <div className="detail-image">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} />
                ) : (
                  <div className="no-image-large">
                    <span>🍽️</span>
                  </div>
                )}
              </div>

              <div className="detail-info">
                <h3>{selectedItem.name}</h3>
                <div className={`status-badge ${selectedItem.available ? 'available' : 'unavailable'}`}>
                  {selectedItem.available ? 'Đang bán' : 'Hết hàng'}
                </div>

                <p className="detail-description">{selectedItem.description}</p>

                <div className="detail-row">
                  <span className="detail-label">Danh mục:</span>
                  <span className="detail-value">{selectedItem.category}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Giá:</span>
                  <span className="detail-value price-large">{selectedItem.price.toLocaleString('vi-VN')}đ</span>
                </div>

                {selectedItem.discount > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Giảm giá:</span>
                    <span className="detail-value discount-value">{selectedItem.discount}%</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Thời gian chế biến:</span>
                  <span className="detail-value">{selectedItem.cookTime} phút</span>
                </div>

                <div className="detail-actions">
                  <button 
                    onClick={() => {
                      setShowDetailModal(false)
                      openEditModal(selectedItem)
                    }}
                    className="detail-btn btn-edit"
                  >
                    Sửa món
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa món này?')) {
                        deleteItem(selectedItem.id)
                        setShowDetailModal(false)
                      }
                    }}
                    className="detail-btn btn-delete"
                  >
                    Xóa món
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement
