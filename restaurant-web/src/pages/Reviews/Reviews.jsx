import { useState } from 'react'
import './Reviews.css'

function Reviews() {
  const [activeTab, setActiveTab] = useState('all')
  const [reviews, setReviews] = useState([
    {
      id: 'r001',
      customerName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Món ăn rất ngon, phục vụ tận tình. Giao hàng nhanh!',
      dishName: 'Cơm Tấm Sườn Nướng',
      date: '15/11/2024 10:30',
      orderId: 'FF1001',
      images: [],
      reply: null
    },
    {
      id: 'r002',
      customerName: 'Trần Thị B',
      rating: 4,
      comment: 'Đồ ăn ngon nhưng hơi lâu một chút',
      dishName: 'Cơm Tấm Đặc Biệt',
      date: '15/11/2024 09:45',
      orderId: 'FF1002',
      images: [],
      reply: 'Cảm ơn quý khách đã đánh giá. Chúng tôi sẽ cải thiện thời gian giao hàng!'
    },
    {
      id: 'r003',
      customerName: 'Lê Văn C',
      rating: 3,
      comment: 'Sườn hơi khô, cần cải thiện',
      dishName: 'Cơm Tấm Sườn Bì Chả',
      date: '14/11/2024 18:20',
      orderId: 'FF1003',
      images: [],
      reply: null
    },
    {
      id: 'r004',
      customerName: 'Phạm Thị D',
      rating: 5,
      comment: 'Tuyệt vời! Sẽ đặt lại nhiều lần nữa',
      dishName: 'Cơm Tấm Sườn Nướng',
      date: '14/11/2024 12:15',
      orderId: 'FF1004',
      images: [],
      reply: 'Cảm ơn quý khách rất nhiều! Mong được phục vụ quý khách lần sau ạ!'
    },
  ])

  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const getFilteredReviews = () => {
    switch(activeTab) {
      case 'all':
        return reviews
      case 'unreplied':
        return reviews.filter(r => !r.reply)
      case '5star':
        return reviews.filter(r => r.rating === 5)
      case '4star':
        return reviews.filter(r => r.rating === 4)
      case '3star':
        return reviews.filter(r => r.rating === 3)
      case 'low':
        return reviews.filter(r => r.rating <= 2)
      default:
        return reviews
    }
  }

  const handleReply = (reviewId) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, reply: replyText } : review
    ))
    setReplyingTo(null)
    setReplyText('')
  }

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  const filteredReviews = getFilteredReviews()
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const ratingStats = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Đánh giá từ khách hàng</h1>
        <p className="subtitle">Quản lý và phản hồi đánh giá</p>
      </div>

      <div className="reviews-overview">
        <div className="rating-summary">
          <div className="avg-rating">
            <span className="rating-number">{avgRating}</span>
            {renderStars(Math.round(parseFloat(avgRating)))}
            <span className="total-reviews">{reviews.length} đánh giá</span>
          </div>
        </div>

        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="rating-row">
              <span className="star-label">{star}★</span>
              <div className="rating-bar">
                <div 
                  className="rating-fill" 
                  style={{ width: `${(ratingStats[star] / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span className="rating-count">{ratingStats[star]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
          <span className="tab-count">{reviews.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unreplied' ? 'active' : ''}`}
          onClick={() => setActiveTab('unreplied')}
        >
          Chưa phản hồi
          <span className="tab-count">{reviews.filter(r => !r.reply).length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === '5star' ? 'active' : ''}`}
          onClick={() => setActiveTab('5star')}
        >
          5★
          <span className="tab-count">{ratingStats[5]}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === '4star' ? 'active' : ''}`}
          onClick={() => setActiveTab('4star')}
        >
          4★
          <span className="tab-count">{ratingStats[4]}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === '3star' ? 'active' : ''}`}
          onClick={() => setActiveTab('3star')}
        >
          3★
          <span className="tab-count">{ratingStats[3]}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'low' ? 'active' : ''}`}
          onClick={() => setActiveTab('low')}
        >
          ≤2★
          <span className="tab-count">{ratingStats[2] + ratingStats[1]}</span>
        </button>
      </div>

      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="empty-state">
            <p>Không có đánh giá nào</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="customer-info">
                  <div className="customer-avatar">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4>{review.customerName}</h4>
                    <p className="review-date">{review.date}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div className="review-content">
                <p className="dish-name">Món: {review.dishName}</p>
                <p className="review-comment">{review.comment}</p>
                <p className="order-id">Đơn hàng: #{review.orderId}</p>
              </div>

              {review.reply ? (
                <div className="reply-section">
                  <div className="reply-header">
                    <span className="reply-icon">↩</span>
                    <span className="reply-label">Phản hồi của nhà hàng:</span>
                  </div>
                  <p className="reply-text">{review.reply}</p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    rows={3}
                  />
                  <div className="reply-actions">
                    <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="cancel-btn">
                      Hủy
                    </button>
                    <button onClick={() => handleReply(review.id)} className="send-btn">
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="reply-btn"
                  onClick={() => setReplyingTo(review.id)}
                >
                  Phản hồi
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews
