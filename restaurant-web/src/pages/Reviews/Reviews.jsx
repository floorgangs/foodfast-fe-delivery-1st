import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { reviewAPI } from '../../services/api';
import './Reviews.css';

const INITIAL_SUMMARY = {
  averageRating: 0,
  totalReviews: 0,
  breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  pendingReplyCount: 0,
};

const formatDateTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return value;
  }
};

function Reviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmittingId, setReplySubmittingId] = useState(null);

  const authRestaurant = useSelector((state) => state.auth.restaurant);

  const storedRestaurantId = (() => {
    const cachedId = localStorage.getItem('foodfastLastRestaurantId');
    if (cachedId) return cachedId;
    try {
      const raw = localStorage.getItem('restaurant_data');
      if (raw && raw !== 'null') {
        const parsed = JSON.parse(raw);
        return parsed?._id || parsed?.id || '';
      }
    } catch (err) {
      console.warn('Không thể đọc restaurant_data từ localStorage:', err);
    }
    return '';
  })();

  const restaurantId =
    authRestaurant?._id || authRestaurant?.id || storedRestaurantId;

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');

      if (!restaurantId) {
        setSummary(INITIAL_SUMMARY);
        setReviews([]);
        setError('Không tìm thấy thông tin nhà hàng. Vui lòng đăng nhập lại.');
        return;
      }

      const [summaryRes, listRes] = await Promise.all([
        reviewAPI.getSummary({ restaurantId }),
        reviewAPI.getAll({ restaurantId, limit: 200 }),
      ]);

      const summaryPayload = summaryRes?.data ?? {};
      const breakdown = {
        ...INITIAL_SUMMARY.breakdown,
        ...(summaryPayload.breakdown || {}),
      };

      setSummary({
        averageRating: summaryPayload.averageRating ?? 0,
        totalReviews: summaryPayload.totalReviews ?? 0,
        breakdown,
        pendingReplyCount: summaryPayload.pendingReplyCount ?? 0,
      });

      const listPayload = Array.isArray(listRes?.data) ? listRes.data : [];
      setReviews(listPayload);
    } catch (err) {
      console.error('Error loading reviews:', err);
      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Không thể tải danh sách đánh giá';
      setError(message);
      setSummary(INITIAL_SUMMARY);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const ratingStats = summary.breakdown;
  const unrepliedCount = useMemo(
    () => reviews.filter((review) => !review?.restaurantReply?.comment).length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    switch (activeTab) {
      case 'unreplied':
        return reviews.filter((review) => !review?.restaurantReply?.comment);
      case '5star':
        return reviews.filter(
          (review) => Math.round(review.rating) === 5
        );
      case '4star':
        return reviews.filter(
          (review) => Math.round(review.rating) === 4
        );
      case '3star':
        return reviews.filter(
          (review) => Math.round(review.rating) === 3
        );
      case 'low':
        return reviews.filter(
          (review) => Math.round(review.rating) <= 2
        );
      case 'all':
      default:
        return reviews;
    }
  }, [activeTab, reviews]);

  const renderStars = (rating) => {
    const rounded = Math.round((rating || 0) * 2) / 2;
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rounded ? 'star filled' : 'star'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleReplySubmit = async (reviewId) => {
    const trimmed = replyText.trim();
    if (!trimmed) {
      return;
    }

    setReplySubmittingId(reviewId);
    try {
      const existingReview = reviews.find((item) => item._id === reviewId);
      const response = await reviewAPI.reply(reviewId, { comment: trimmed });
      const updatedReview = response?.data || response;

      setReviews((prev) =>
        prev.map((item) => (item._id === reviewId ? updatedReview : item))
      );

      if (
        existingReview &&
        !existingReview?.restaurantReply?.comment &&
        updatedReview?.restaurantReply?.comment
      ) {
        setSummary((prev) => ({
          ...prev,
          pendingReplyCount: Math.max(prev.pendingReplyCount - 1, 0),
        }));
      }

      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Error replying review:', err);
      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Không thể gửi phản hồi';
      setError(message);
    } finally {
      setReplySubmittingId(null);
    }
  };

  const avgRating =
    summary.totalReviews > 0
      ? (summary.averageRating ?? 0).toFixed(1)
      : '0.0';

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Đánh giá từ khách hàng</h1>
        <p className="subtitle">Quản lý và phản hồi đánh giá</p>
      </div>

      {error && (
        <div className="reviews-error">
          <span>{error}</span>
          <button type="button" onClick={loadReviews}>
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="reviews-loading">
          <div className="spinner" />
          <p>Đang tải dữ liệu đánh giá...</p>
        </div>
      ) : (
        <>
          <div className="reviews-overview">
            <div className="rating-summary">
              <div className="avg-rating">
                <span className="rating-number">{avgRating}</span>
                {renderStars(Number(summary.averageRating || 0))}
                <span className="total-reviews">
                  {summary.totalReviews} đánh giá
                </span>
                <span className="pending-reply">
                  Chưa phản hồi: {summary.pendingReplyCount}
                </span>
              </div>
            </div>

            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="rating-row">
                  <span className="star-label">{star}★</span>
                  <div className="rating-bar">
                    <div
                      className="rating-fill"
                      style={{
                        width: `${
                          summary.totalReviews
                            ? (ratingStats[star] / summary.totalReviews) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="rating-count">
                    {ratingStats[star] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả
              <span className="tab-count">{summary.totalReviews}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'unreplied' ? 'active' : ''}`}
              onClick={() => setActiveTab('unreplied')}
            >
              Chưa phản hồi
              <span className="tab-count">{unrepliedCount}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === '5star' ? 'active' : ''}`}
              onClick={() => setActiveTab('5star')}
            >
              5★
              <span className="tab-count">{ratingStats[5] ?? 0}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === '4star' ? 'active' : ''}`}
              onClick={() => setActiveTab('4star')}
            >
              4★
              <span className="tab-count">{ratingStats[4] ?? 0}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === '3star' ? 'active' : ''}`}
              onClick={() => setActiveTab('3star')}
            >
              3★
              <span className="tab-count">{ratingStats[3] ?? 0}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'low' ? 'active' : ''}`}
              onClick={() => setActiveTab('low')}
            >
              ≤2★
              <span className="tab-count">
                {(ratingStats[2] ?? 0) + (ratingStats[1] ?? 0)}
              </span>
            </button>
          </div>

          <div className="reviews-list">
            {filteredReviews.length === 0 ? (
              <div className="empty-state">
                <p>Không có đánh giá nào cho bộ lọc đã chọn</p>
              </div>
            ) : (
              filteredReviews.map((review) => {
                const customerName = review?.customer?.name || 'Ẩn danh';
                const customerInitial = customerName.charAt(0).toUpperCase();
                const reviewDate = formatDateTime(review?.createdAt);
                const dishName =
                  review?.product?.name || 'Đánh giá cho nhà hàng';
                const orderNumber = review?.order?.orderNumber || 'N/A';
                const hasReply = Boolean(review?.restaurantReply?.comment);

                return (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {customerInitial}
                        </div>
                        <div>
                          <h4>{customerName}</h4>
                          <p className="review-date">{reviewDate}</p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    <div className="review-content">
                      <p className="dish-name">Món: {dishName}</p>
                      <p className="review-comment">{review.comment}</p>
                      <p className="order-id">Đơn hàng: #{orderNumber}</p>
                    </div>

                    {hasReply ? (
                      <div className="reply-section">
                        <div className="reply-header">
                          <span className="reply-icon">↩</span>
                          <span className="reply-label">
                            Phản hồi của nhà hàng (
                            {formatDateTime(review.restaurantReply?.timestamp)})
                          </span>
                        </div>
                        <p className="reply-text">
                          {review.restaurantReply?.comment}
                        </p>
                      </div>
                    ) : replyingTo === review._id ? (
                      <div className="reply-form">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập phản hồi của bạn..."
                          rows={3}
                        />
                        <div className="reply-actions">
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="send-btn"
                            disabled={
                              replySubmittingId === review._id ||
                              replyText.trim().length === 0
                            }
                            onClick={() => handleReplySubmit(review._id)}
                          >
                            {replySubmittingId === review._id
                              ? 'Đang gửi...'
                              : 'Gửi phản hồi'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="reply-btn"
                        onClick={() => {
                          setReplyingTo(review._id);
                          setReplyText('');
                          setError('');
                        }}
                      >
                        Phản hồi
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reviews;
