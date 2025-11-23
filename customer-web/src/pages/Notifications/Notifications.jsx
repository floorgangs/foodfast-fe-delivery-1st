import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { notificationAPI } from "../../services/api";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      const data = response?.data ?? response;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return "🚁";
      case "promo":
        return "🎁";
      case "system":
        return "📱";
      default:
        return "📬";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <h1>Thông báo</h1>
          {notifications.length > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-btn">
              Đọc tất cả
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>Chưa có thông báo</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${
                  !notification.isRead ? "unread" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification._id);
                  }
                  if (notification.relatedOrder) {
                    navigate(`/order-tracking/${notification.relatedOrder._id}`);
                  }
                }}
              >
                <div className={`notification-icon ${notification.type}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    {!notification.isRead && <span className="unread-dot"></span>}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
