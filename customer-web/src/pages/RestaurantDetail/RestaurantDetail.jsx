import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import axios from "axios";
import "./RestaurantDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant
        const restaurantRes = await axios.get(`${API_URL}/restaurants/${id}`);
        if (restaurantRes.data.success) {
          setRestaurant(restaurantRes.data.data);
        }

        // Fetch products
        const productsRes = await axios.get(`${API_URL}/products`, {
          params: { restaurant: id },
        });
        if (productsRes.data.success) {
          setMenu(productsRes.data.data);
        }

        // Fetch reviews
        const reviewsRes = await axios.get(`${API_URL}/reviews`, {
          params: { restaurant: id },
        });
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <img
            src={restaurant.image || restaurant.avatar}
            alt={restaurant.name}
          />
          <div className="restaurant-header-info">
            <h1>{restaurant.name}</h1>
            <p className="cuisine">
              {Array.isArray(restaurant.cuisine)
                ? restaurant.cuisine.join(", ")
                : restaurant.cuisine || restaurant.description}
            </p>
            <div className="meta-info">
              <span>⭐ {restaurant.rating || 0}</span>
              <span>🚁 {restaurant.estimatedDeliveryTime || "30-45 phút"}</span>
              <span>
                💰 Phí ship:{" "}
                {(restaurant.deliveryFee || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <p className="address">
              📍{" "}
              {typeof restaurant.address === "string"
                ? restaurant.address
                : `${restaurant.address?.street || ""}, ${
                    restaurant.address?.ward || ""
                  }, ${restaurant.address?.district || ""}, ${
                    restaurant.address?.city || ""
                  }`}
            </p>
            {restaurant.isActive === false && (
              <div className="closed-notice">Nhà hàng hiện đã đóng cửa</div>
            )}
            {restaurant.isBusy && (
              <div
                className="closed-notice"
                style={{ backgroundColor: "#ff9800" }}
              >
                Nhà hàng hiện đang bận, thời gian chờ có thể lâu hơn
              </div>
            )}
          </div>
        </div>

        <div className="menu-section">
          <h2>Thực đơn</h2>
          <div className="menu-grid">
            {menu.map((product) => (
              <div key={product._id} className="menu-item">
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
                      disabled={!restaurant.isActive}
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
                <div
                  key={review._id || review.id || index}
                  className="review-item"
                >
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
