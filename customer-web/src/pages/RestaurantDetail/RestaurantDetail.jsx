import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { restaurants, products, mockReviews } from "../../data/mockData";
import "./RestaurantDetail.css";

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const foundRestaurant = restaurants.find((r) => r.id === id);
    setRestaurant(foundRestaurant);
    setMenu(products[id] || []);

    // Load reviews - merge mock reviews with real reviews from localStorage
    const mockRestaurantReviews = mockReviews[id] || [];
    const storedReviews = JSON.parse(
      localStorage.getItem("foodfast_reviews") || "[]"
    );
    const realRestaurantReviews = storedReviews.filter(
      (r) => r.restaurantId === id
    );

    // Combine and sort by date (newest first)
    const allReviews = [
      ...mockRestaurantReviews,
      ...realRestaurantReviews,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setReviews(allReviews);
  }, [id]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, restaurantId: id }));
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (!restaurant) {
    return (
      <div className="container">
        <p>Không tìm thấy nhà hàng</p>
      </div>
    );
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
            {menu.map((product) => (
              <div key={product.id} className="menu-item">
                <img src={product.image} alt={product.name} />
                <div className="menu-item-info">
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>
                  <div className="menu-item-footer">
                    <span className="price">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
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

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Đánh giá ({reviews.length})</h2>
            {reviews.length > 0 && (
              <div className="average-rating">
                <span className="rating-number">
                  {calculateAverageRating()}
                </span>
                <span className="rating-stars">
                  {"⭐".repeat(Math.round(calculateAverageRating()))}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={review.id || index} className="review-item">
                  <div className="review-header-item">
                    <div className="review-user">
                      <div className="user-avatar">
                        {review.customerName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {review.customerName || "Khách hàng"}
                        </span>
                        <span className="review-date">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {"⭐".repeat(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>Chưa có đánh giá nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;
