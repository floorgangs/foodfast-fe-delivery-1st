import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, addReview } from "../../services/orderService";
import "./Review.css";

function Review() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const order = getOrderById(orderId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!order) {
    return (
      <div className="review-page">
        <div className="container">
          <p>Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  if (order.review) {
    return (
      <div className="review-page">
        <div className="container">
          <div className="review-card">
            <h2>Bạn đã đánh giá đơn hàng này</h2>
            <div className="existing-review">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= order.review.rating ? "active" : ""}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="review-comment">{order.review.comment}</p>
              <button className="btn-primary" onClick={() => navigate("/")}>
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get customer name from localStorage or use default
    const customerData = JSON.parse(
      localStorage.getItem("customer_user") || "{}"
    );
    const customerName =
      customerData.name || customerData.email?.split("@")[0] || "Khách hàng";

    const reviewData = {
      customerName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    addReview(orderId, reviewData);

    alert("Cảm ơn bạn đã đánh giá!");
    navigate("/");
  };

  return (
    <div className="review-page">
      <div className="container">
        <div className="review-card">
          <h1>Đánh giá đơn hàng</h1>
          <p className="order-id">Mã đơn: #{orderId}</p>

          <div className="restaurant-info">
            <h3>{order.restaurantName}</h3>
            <p>{order.restaurantAddress}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Đánh giá của bạn:</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      star <= (hoveredStar || rating) ? "active" : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 5 && "Tuyệt vời!"}
                {rating === 4 && "Hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 2 && "Không hài lòng"}
                {rating === 1 && "Rất tệ"}
              </p>
            </div>

            <div className="comment-section">
              <label>Nhận xét của bạn:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về món ăn và dịch vụ..."
                rows="5"
                required
              />
            </div>

            <div className="items-reviewed">
              <h4>Món đã đặt:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="item">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/")}
              >
                Bỏ qua
              </button>
              <button type="submit" className="btn-primary">
                Gửi đánh giá
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Review;
