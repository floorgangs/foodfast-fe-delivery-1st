import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { restaurants } from "../../data/mockData";
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

  useEffect(() => {
    setRestaurantList(restaurants);
  }, []);

  const filteredRestaurants = restaurantList.filter((restaurant) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.cuisine.toLowerCase().includes(searchLower) ||
      (restaurant.dishes &&
        restaurant.dishes.some((dish) =>
          dish.toLowerCase().includes(searchLower)
        ));
    const matchesCategory =
      category === "all" || restaurant.category === category;
    const matchesRating = restaurant.rating >= minRating;
    const matchesPrice = restaurant.avgPrice <= maxPrice;
    const matchesShipping = !freeShippingOnly || restaurant.freeShipping;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesRating &&
      matchesPrice &&
      matchesShipping
    );
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === "price-high") return b.avgPrice - a.avgPrice;
    if (sortBy === "price-low") return a.avgPrice - b.avgPrice;
    if (sortBy === "free-ship")
      return (b.freeShipping ? 1 : 0) - (a.freeShipping ? 1 : 0);
    return 0;
  });

  const resetFilters = () => {
    setMinRating(0);
    setMaxPrice(500000);
    setSortBy("default");
    setFreeShippingOnly(false);
  };

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
            Tất cả
          </button>
          <button
            className={category === "vietnamese" ? "active" : ""}
            onClick={() => setCategory("vietnamese")}
          >
            Món Việt
          </button>
          <button
            className={category === "fastfood" ? "active" : ""}
            onClick={() => setCategory("fastfood")}
          >
            Fastfood
          </button>
          <button
            className={category === "asian" ? "active" : ""}
            onClick={() => setCategory("asian")}
          >
            Món Á
          </button>
          <button
            className={category === "drink" ? "active" : ""}
            onClick={() => setCategory("drink")}
          >
            Đồ uống
          </button>
        </div>

        <div className="restaurants-grid">
          {sortedRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.id}`}
              className="restaurant-card"
            >
              <div className="restaurant-image">
                <img src={restaurant.image} alt={restaurant.name} />
                {restaurant.freeShipping && (
                  <span className="free-ship-badge">🚀 Free ship</span>
                )}
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
                  <span className="delivery-time">
                    🚁 {restaurant.deliveryTime}
                  </span>
                </div>
                <p className="address">{restaurant.address}</p>
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
