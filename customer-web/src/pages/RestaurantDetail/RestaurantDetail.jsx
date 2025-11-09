import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import { restaurants, products } from '../../data/mockData'
import './RestaurantDetail.css'

function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState([])

  useEffect(() => {
    const foundRestaurant = restaurants.find(r => r.id === id)
    setRestaurant(foundRestaurant)
    setMenu(products[id] || [])
  }, [id])

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, restaurantId: id }))
    alert(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  if (!restaurant) {
    return <div className="container"><p>Không tìm thấy nhà hàng</p></div>
  }

  return (
    <div className="restaurant-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Quay lại
        </button>

        <div className="restaurant-header">
          <img src={restaurant.image} alt={restaurant.name} />
          <div className="restaurant-header-info">
            <h1>{restaurant.name}</h1>
            <p className="cuisine">{restaurant.cuisine}</p>
            <div className="meta-info">
              <span>⭐ {restaurant.rating}</span>
              <span>🚁 {restaurant.deliveryTime}</span>
              <span>💰 {restaurant.priceRange}</span>
            </div>
            <p className="address">📍 {restaurant.address}</p>
            {!restaurant.isOpen && (
              <div className="closed-notice">Nhà hàng hiện đã đóng cửa</div>
            )}
          </div>
        </div>

        <div className="menu-section">
          <h2>Thực đơn</h2>
          <div className="menu-grid">
            {menu.map(product => (
              <div key={product.id} className="menu-item">
                <img src={product.image} alt={product.name} />
                <div className="menu-item-info">
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>
                  <div className="menu-item-footer">
                    <span className="price">{product.price.toLocaleString('vi-VN')}đ</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={!restaurant.isOpen}
                      className="add-btn"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {menu.length === 0 && (
            <div className="no-menu">
              <p>Nhà hàng chưa có thực đơn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetail
