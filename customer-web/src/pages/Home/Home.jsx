import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { restaurantAPI } from "../../services/api";
import "./Home.css";

function Home() {
  const [restaurantList, setRestaurantList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortBy, setSortBy] = useState("default");
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Auto scroll banner
  useEffect(() => {
    if (restaurantList.length === 0) return;
    const bannerCount = Math.min(restaurantList.length, 6);
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerCount);
    }, 4000);
    return () => clearInterval(interval);
  }, [restaurantList]);

  // Scroll to active slide
  useEffect(() => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: activeSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [activeSlide]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantAPI.getAll();
      const data = response?.data ?? response;
      setRestaurantList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurantList.filter((restaurant) => {
    // Only show active and approved restaurants
    if (!restaurant.isActive || !restaurant.isApproved) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.description?.toLowerCase().includes(searchLower) ||
      (restaurant.cuisine &&
        restaurant.cuisine.some((c) => c.toLowerCase().includes(searchLower)));
    
    // Normalize category matching giống mobile app
    const normalizedCategory = category.trim().toLowerCase();
    const matchesCategory =
      category === "all" ||
      (restaurant.cuisine?.some((item) =>
        String(item).toLowerCase() === normalizedCategory
      )) ||
      restaurant.name.toLowerCase().includes(normalizedCategory);
    
    const matchesRating = restaurant.rating >= minRating;
    const matchesPrice =
      maxPrice === 500000 ||
      (restaurant.minOrder && restaurant.minOrder <= maxPrice);
    const matchesShipping = !freeShippingOnly || restaurant.deliveryFee === 0;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesRating &&
      matchesPrice &&
      matchesShipping
    );
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === "price-high") return (b.minOrder || 0) - (a.minOrder || 0);
    if (sortBy === "price-low") return (a.minOrder || 0) - (b.minOrder || 0);
    if (sortBy === "free-ship")
      return (a.deliveryFee === 0 ? 1 : 0) - (b.deliveryFee === 0 ? 1 : 0);
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const resetFilters = () => {
    setMinRating(0);
    setMaxPrice(500000);
    setSortBy("default");
    setFreeShippingOnly(false);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="loading">Đang tải nhà hàng...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={fetchRestaurants} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Banner Carousel */}
      <div className="banner-carousel">
        <div className="carousel-wrapper" ref={carouselRef}>
          {restaurantList.slice(0, 6).map((restaurant, index) => (
            <Link 
              key={restaurant._id || index} 
              to={`/restaurant/${restaurant._id}`}
              className="banner-slide"
            >
              <img 
                src={restaurant.coverImage || restaurant.avatar} 
                alt={restaurant.name}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";
                }}
              />
              <div className="banner-overlay">
                <span className="banner-tag">Đối tác nổi bật</span>
                <h2>{restaurant.name}</h2>
                <p>{restaurant.description || "Giao nhanh • Chất lượng"}</p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Indicators */}
        <div className="carousel-indicators">
          {restaurantList.slice(0, 6).map((_, index) => (
            <button
              key={index}
              className={`indicator ${activeSlide === index ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="container">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <div className="search-input-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng, món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M3 6h18M6 12h12M9 18h6"/>
              </svg>
              Bộ lọc
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>Đánh giá tối thiểu</label>
                <div className="star-buttons">
                  {[0, 1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={minRating === star ? "active" : ""}
                      onClick={() => setMinRating(star)}
                    >
                      {star === 0 ? "Tất cả" : `${star} sao`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>
                  Giá tối đa: {maxPrice.toLocaleString("vi-VN")}đ
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="filter-group">
                <label>Sắp xếp theo</label>
                <div className="sort-options">
                  <button
                    className={sortBy === "default" ? "active" : ""}
                    onClick={() => setSortBy("default")}
                  >
                    Mặc định
                  </button>
                  <button
                    className={sortBy === "price-high" ? "active" : ""}
                    onClick={() => setSortBy("price-high")}
                  >
                    Giá cao → thấp
                  </button>
                  <button
                    className={sortBy === "price-low" ? "active" : ""}
                    onClick={() => setSortBy("price-low")}
                  >
                    Giá thấp → cao
                  </button>
                  <button
                    className={sortBy === "free-ship" ? "active" : ""}
                    onClick={() => setSortBy("free-ship")}
                  >
                    Miễn phí ship
                  </button>
                </div>
              </div>

              <div className="filter-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={freeShippingOnly}
                    onChange={(e) => setFreeShippingOnly(e.target.checked)}
                  />
                  <span>Chỉ hiển thị miễn phí giao hàng</span>
                </label>
              </div>

              <button className="reset-filters" onClick={resetFilters}>
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>

        <div className="category-filter">
          <button
            className={category === "all" ? "active" : ""}
            onClick={() => setCategory("all")}
          >
            Tất cả
          </button>
          <button
            className={category === "pizza" ? "active" : ""}
            onClick={() => setCategory("pizza")}
          >
            Pizza
          </button>
          <button
            className={category === "burger" ? "active" : ""}
            onClick={() => setCategory("burger")}
          >
            Burger
          </button>
          <button
            className={category === "phở" ? "active" : ""}
            onClick={() => setCategory("phở")}
          >
            Phở
          </button>
          <button
            className={category === "cơm" ? "active" : ""}
            onClick={() => setCategory("cơm")}
          >
            Cơm
          </button>
          <button
            className={category === "bánh" ? "active" : ""}
            onClick={() => setCategory("bánh")}
          >
            Bánh
          </button>
          <button
            className={category === "Đồ uống" ? "active" : ""}
            onClick={() => setCategory("Đồ uống")}
          >
            Đồ uống
          </button>
          <button
            className={category === "gà" ? "active" : ""}
            onClick={() => setCategory("gà")}
          >
            Gà rán
          </button>
          <button
            className={category === "salad" ? "active" : ""}
            onClick={() => setCategory("salad")}
          >
            Salad
          </button>
        </div>

        <div className="restaurants-grid">
          {sortedRestaurants.map((restaurant) => (
            <Link
              key={restaurant._id}
              to={`/restaurant/${restaurant._id}`}
              className="restaurant-card"
            >
              <div className="restaurant-image">
                <img
                  src={restaurant.coverImage || restaurant.avatar}
                  alt={restaurant.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=Restaurant";
                  }}
                />
                {restaurant.isActive && !restaurant.isBusy ? (
                  <span className="status-badge open">Mở</span>
                ) : (
                  <span className="status-badge closed">
                    {restaurant.isBusy ? "Bận" : "Đóng"}
                  </span>
                )}
              </div>
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <div className="restaurant-meta">
                  <span className="rating">
                    <svg viewBox="0 0 24 24" fill="#f59e0b" width="14" height="14">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {restaurant.rating.toFixed(1)}
                  </span>
                  <span className="meta-dot">•</span>
                  <span className="delivery-time">
                    {restaurant.estimatedDeliveryTime}
                  </span>
                </div>
                <p className="address">
                  {restaurant.address?.street}, {restaurant.address?.district}
                </p>
                <div className="restaurant-footer">
                  <span className="promo-tag">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    Drone siêu tốc
                  </span>
                  <span className="delivery-fee">
                    {restaurant.deliveryFee === 0
                      ? "Miễn phí giao"
                      : `Ship ${restaurant.deliveryFee?.toLocaleString()}đ`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {sortedRestaurants.length === 0 && (
          <div className="no-results">
            <p>Không tìm thấy nhà hàng nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
