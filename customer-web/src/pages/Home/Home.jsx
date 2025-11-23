import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchRestaurants();
  }, []);

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
      <div className="container">
        <div className="hero">
          <h1>🚁 Giao hàng bằng Drone</h1>
          <p>Nhanh chóng - An toàn - Tiện lợi</p>
        </div>

        <div className="search-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng, món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "▲" : "▼"} Tìm kiếm nâng cao
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>⭐ Đánh giá tối thiểu</label>
                <div className="star-buttons">
                  {[0, 1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={minRating === star ? "active" : ""}
                      onClick={() => setMinRating(star)}
                    >
                      {star === 0 ? "Tất cả" : `${star}⭐`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>
                  💰 Giá tối đa: {maxPrice.toLocaleString("vi-VN")}đ
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
                <label>📦 Sắp xếp theo</label>
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
                    Giá cao đến thấp
                  </button>
                  <button
                    className={sortBy === "price-low" ? "active" : ""}
                    onClick={() => setSortBy("price-low")}
                  >
                    Giá thấp đến cao
                  </button>
                  <button
                    className={sortBy === "free-ship" ? "active" : ""}
                    onClick={() => setSortBy("free-ship")}
                  >
                    Free ship
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
                  <span>🚀 Chỉ hiển thị free shipping</span>
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
            <span className="category-icon">🍽️</span>
            <span className="category-label">Tất cả</span>
          </button>
          <button
            className={category === "pizza" ? "active" : ""}
            onClick={() => setCategory("pizza")}
          >
            <span className="category-icon">🍕</span>
            <span className="category-label">Pizza</span>
          </button>
          <button
            className={category === "burger" ? "active" : ""}
            onClick={() => setCategory("burger")}
          >
            <span className="category-icon">🍔</span>
            <span className="category-label">Burger</span>
          </button>
          <button
            className={category === "phở" ? "active" : ""}
            onClick={() => setCategory("phở")}
          >
            <span className="category-icon">🍜</span>
            <span className="category-label">Phở</span>
          </button>
          <button
            className={category === "cơm" ? "active" : ""}
            onClick={() => setCategory("cơm")}
          >
            <span className="category-icon">🍱</span>
            <span className="category-label">Cơm</span>
          </button>
          <button
            className={category === "bánh" ? "active" : ""}
            onClick={() => setCategory("bánh")}
          >
            <span className="category-icon">🍰</span>
            <span className="category-label">Bánh</span>
          </button>
          <button
            className={category === "Đồ uống" ? "active" : ""}
            onClick={() => setCategory("Đồ uống")}
          >
            <span className="category-icon">☕</span>
            <span className="category-label">Đồ uống</span>
          </button>
          <button
            className={category === "gà" ? "active" : ""}
            onClick={() => setCategory("gà")}
          >
            <span className="category-icon">🍗</span>
            <span className="category-label">Gà rán</span>
          </button>
          <button
            className={category === "salad" ? "active" : ""}
            onClick={() => setCategory("salad")}
          >
            <span className="category-icon">🥗</span>
            <span className="category-label">Salad</span>
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
                  <span className="status-badge open">Đang mở</span>
                ) : (
                  <span className="status-badge closed">
                    {restaurant.isBusy ? "Bận" : "Đã đóng"}
                  </span>
                )}
              </div>
              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <div className="restaurant-meta">
                  <span className="rating">
                    ⭐ {restaurant.rating.toFixed(1)}
                  </span>
                  <span className="delivery-time">
                    🚁 {restaurant.estimatedDeliveryTime}
                  </span>
                </div>
                <p className="address">
                  {restaurant.address?.street}, {restaurant.address?.district},{" "}
                  {restaurant.address?.city}
                </p>
                <div className="restaurant-footer">
                  <span className="min-order">
                    {restaurant.minOrder?.toLocaleString()}đ
                  </span>
                  <span className="delivery-fee">
                    {restaurant.deliveryFee === 0
                      ? "🚀 Free"
                      : `${restaurant.deliveryFee?.toLocaleString()}đ`}
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
