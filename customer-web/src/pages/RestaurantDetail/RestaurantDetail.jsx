import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { restaurantAPI, productAPI, reviewAPI } from "../../services/api";
import "./RestaurantDetail.css";

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: cartItems, currentRestaurantId, currentRestaurantName } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=FoodFast";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant
        const restaurantRes = await restaurantAPI.getById(id);
        const restaurantData = restaurantRes?.data ?? restaurantRes;
        setRestaurant(restaurantData);

        // Fetch products
        const productsRes = await productAPI.getByRestaurant(id);
        const productsData = productsRes?.data ?? productsRes;
        setMenu(Array.isArray(productsData) ? productsData : []);

        // Fetch reviews
        const reviewsRes = await reviewAPI.getAll({ restaurantId: id });
        const reviewsData = reviewsRes?.data ?? reviewsRes;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async (product) => {
    if (!product) return;

    if (!isAuthenticated) {
      const shouldGoToLogin = window.confirm("Bạn cần đăng nhập để thêm món vào giỏ hàng. Có muốn chuyển đến trang đăng nhập không?");
      if (shouldGoToLogin) {
        navigate("/login", { state: { from: location.pathname, pendingAdd: { productId: product._id || product.id, restaurantId: id } } });
      }
      return;
    }

    const activeRestaurantId = String(restaurant?._id || id || "");
    if (!activeRestaurantId) {
      alert("Không thể xác định nhà hàng. Vui lòng thử lại sau.");
      return;
    }
    if (
      cartItems.length > 0 &&
      currentRestaurantId &&
      currentRestaurantId !== String(activeRestaurantId)
    ) {
      const confirmSwitch = window.confirm(
        `Giỏ hàng đang có món từ "${currentRestaurantName}". Nếu tiếp tục, giỏ hiện tại sẽ được thay bằng món mới. Bạn có muốn tiếp tục?`
      );
      if (!confirmSwitch) {
        return;
      }
    }

    try {
      const imageSource = product.primaryImage || product.image || restaurant?.image || restaurant?.avatar;
      await dispatch(addToCart({
        id: product._id || product.id,
        productId: product._id || product.id,
        name: product.name,
        price: product.price ?? 0,
        restaurantId: activeRestaurantId,
        restaurantName: restaurant?.name || "",
        image: imageSource,
      }));
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert(error?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const enhancedMenu = useMemo(() => {
    return menu.map((product) => {
      const numericRating = Number(product.rating ?? 0);
      const formattedRating = Number.isFinite(numericRating)
        ? Number(numericRating.toFixed(1))
        : 0;
      const reviewCount = Number(product.totalReviews ?? product.reviewCount ?? 0);
      const restaurantFallback = restaurant?.image || restaurant?.avatar || PLACEHOLDER_IMAGE;
      const primaryImage = product.image
        || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null)
        || restaurantFallback;
      const displayImage = imageErrors[product._id || product.id]
        ? restaurantFallback
        : primaryImage;

      return {
        ...product,
        rating: formattedRating,
        reviewCount: reviewCount > 0 ? reviewCount : 0,
        displayImage,
        primaryImage,
      };
    });
  }, [menu, imageErrors, restaurant, PLACEHOLDER_IMAGE]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (rating >= index + 1 ? "★" : "☆")).join("");
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
            {enhancedMenu.map((product) => (
              <div key={product._id || product.id} className="menu-item">
                <div className="menu-item-image">
                  <img
                    src={product.displayImage}
                    alt={product.name}
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [product._id || product.id]: true,
                      }))
                    }
                  />
                </div>
                <div className="menu-item-info">
                  <div className="menu-item-header">
                    <h3>{product.name}</h3>
                    <div className="menu-item-rating">
                      <span className="stars">{renderStars(product.rating)}</span>
                      <span className="rating-value">{product.rating.toFixed(1)}</span>
                      <span className="rating-count">({product.reviewCount.toLocaleString("vi-VN")})</span>
                    </div>
                  </div>
                  <p className="menu-description">{product.description || ""}</p>
                  {(product.soldCount || product.preparationTime) && (
                    <div className="menu-item-meta">
                      {product.soldCount ? (
                        <span>Đã bán {product.soldCount.toLocaleString("vi-VN")}</span>
                      ) : null}
                      {product.preparationTime ? (
                        <span>⏱️ {product.preparationTime}</span>
                      ) : null}
                    </div>
                  )}
                  <div className="menu-item-footer">
                    <span className="price">
                      {Number(product.price || 0).toLocaleString("vi-VN")}đ
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={restaurant?.isActive === false}
                      className="add-btn"
                      title={
                        restaurant?.isActive === false
                          ? "Nhà hàng tạm đóng cửa"
                          : "Thêm vào giỏ hàng"
                      }
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
                        {(review.customer?.name || review.customerName || "K").charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {review.customer?.name || review.customerName || "Khách hàng"}
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
