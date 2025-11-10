import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { restaurants } from '../../data/mockData'
import './Home.css'

function Home() {
  const [restaurantList, setRestaurantList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    setRestaurantList(restaurants)
  }, [])

  const filteredRestaurants = restaurantList.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = category === 'all' || restaurant.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero">
          <h1>🚁 Giao hàng bằng Drone</h1>
          <p>Nhanh chóng - An toàn - Tiện lợi</p>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng, món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <button 
            className={category === 'all' ? 'active' : ''} 
            onClick={() => setCategory('all')}
          >
            Tất cả
          </button>
          <button 
            className={category === 'vietnamese' ? 'active' : ''} 
            onClick={() => setCategory('vietnamese')}
          >
            Món Việt
          </button>
          <button 
            className={category === 'fastfood' ? 'active' : ''} 
            onClick={() => setCategory('fastfood')}
          >
            Fastfood
          </button>
          <button 
            className={category === 'asian' ? 'active' : ''} 
            onClick={() => setCategory('asian')}
          >
            Món Á
          </button>
          <button 
            className={category === 'drink' ? 'active' : ''} 
            onClick={() => setCategory('drink')}
          >
            Đồ uống
          </button>
        </div>

        <div className="restaurants-grid">
          {filteredRestaurants.map(restaurant => (
            <Link 
              key={restaurant.id} 
              to={`/restaurant/${restaurant.id}`} 
              className="restaurant-card"
            >
              <div className="restaurant-image">
                <img src={restaurant.image} alt={restaurant.name} />
                {restaurant.isOpen ? (
                  <span className="status-badge open">Đang mở</span>
                ) : (
                  <span className="status-badge closed">Đã đóng</span>
                )}
              </div>
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p className="cuisine">{restaurant.cuisine}</p>
                <div className="restaurant-meta">
                  <span className="rating">⭐ {restaurant.rating}</span>
                  <span className="delivery-time">🚁 {restaurant.deliveryTime}</span>
                </div>
                <p className="address">{restaurant.address}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="no-results">
            <p>Không tìm thấy nhà hàng nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
