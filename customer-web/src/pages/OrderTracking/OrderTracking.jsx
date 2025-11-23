import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderAPI } from "../../services/api";
import "./OrderTracking.css";

const STATUS_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', icon: '⏳', description: 'Đơn hàng đang chờ nhà hàng xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: '✅', description: 'Nhà hàng đã tiếp nhận và chuẩn bị đơn' },
  { key: 'preparing', label: 'Chuẩn bị', icon: '👨‍🍳', description: 'Nhà hàng đang chuẩn bị món ăn' },
  { key: 'ready', label: 'Sẵn sàng', icon: '📦', description: 'Đơn đã đóng gói, chờ drone tiếp nhận' },
  { key: 'delivering', label: 'Đang giao', icon: '🚁', description: 'Drone đang trên đường bay tới vị trí của bạn' },
  { key: 'delivered', label: 'Hoàn thành', icon: '🎉', description: 'Bạn đã nhận được đơn hàng' },
];

const STATUS_SEQUENCE = STATUS_STEPS.map(step => step.key);
const HCM_CENTER = { lat: 10.7769, lng: 106.7009 };

function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    pickup: null,
    delivery: null,
    drone: null,
    polyline: null,
    progressPolyline: null
  });

  // Fetch tracking data
  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    const fetchTracking = async () => {
      try {
        const response = await orderAPI.track(orderId);
        if (response?.data) {
          setTrackingData(response.data);
          setError(null);
        } else {
          setError('Không nhận được dữ liệu theo dõi');
        }
      } catch (err) {
        console.error('[OrderTracking] fetch error:', err);
        setError(err.message || 'Không thể tải dữ liệu theo dõi');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Reset acknowledged when status changes
  useEffect(() => {
    const normalizedStatus = normalizeStatus(trackingData?.order?.status);
    if (normalizedStatus !== 'delivered') {
      setAcknowledged(false);
    }
  }, [trackingData?.order?.status]);

  const handleConfirm = () => {
    setAcknowledged(true);
    alert('Cảm ơn bạn! Đơn hàng đã được xác nhận.');
  };

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    if (status === 'completed') return 'delivered';
    if (status === 'ready_for_delivery') return 'ready';
    return status;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize Google Maps
  useEffect(() => {
    const normalizedStatus = normalizeStatus(trackingData?.order?.status);
    if (normalizedStatus !== 'delivering' || !window.google) return;

    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer || mapInstanceRef.current) return;

    // Create map
    const map = new window.google.maps.Map(mapContainer, {
      center: HCM_CENTER,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;
    mapRef.current = mapContainer;
  }, [trackingData?.order?.status]);

  // Update map markers and route
  useEffect(() => {
    if (!mapInstanceRef.current || !trackingData?.tracking) return;

    const map = mapInstanceRef.current;
    const tracking = trackingData.tracking;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => {
      if (marker) marker.setMap(null);
    });

    // Get coordinates
    const pickupCoords = tracking.pickupLocation?.coordinates;
    const deliveryCoords = tracking.deliveryLocation?.coordinates;
    const droneCoords = tracking.droneLocation;

    const pickupPos = pickupCoords ? { lat: pickupCoords.lat, lng: pickupCoords.lng } : HCM_CENTER;
    const deliveryPos = deliveryCoords ? { lat: deliveryCoords.lat, lng: deliveryCoords.lng } : { lat: HCM_CENTER.lat + 0.02, lng: HCM_CENTER.lng + 0.02 };

    // Create pickup marker (restaurant)
    markersRef.current.pickup = new window.google.maps.Marker({
      position: pickupPos,
      map: map,
      title: tracking.pickupLocation?.name || 'Nhà hàng',
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" fill="#EA5034" stroke="white" stroke-width="3"/>
              <text x="20" y="27" font-size="18" text-anchor="middle" fill="white">🏪</text>
            </svg>
          `)
      }
    });

    // Create delivery marker (home)
    markersRef.current.delivery = new window.google.maps.Marker({
      position: deliveryPos,
      map: map,
      title: 'Điểm giao hàng',
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" fill="#27AE60" stroke="white" stroke-width="3"/>
              <text x="20" y="27" font-size="18" text-anchor="middle" fill="white">🏠</text>
            </svg>
          `)
      }
    });

    // Build route coordinates (30 points for smooth line)
    const routeCoordinates = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      routeCoordinates.push({
        lat: pickupPos.lat + (deliveryPos.lat - pickupPos.lat) * t,
        lng: pickupPos.lng + (deliveryPos.lng - pickupPos.lng) * t
      });
    }

    // Create full route polyline (gray)
    markersRef.current.polyline = new window.google.maps.Polyline({
      path: routeCoordinates,
      geodesic: true,
      strokeColor: '#1B2945',
      strokeOpacity: 0.3,
      strokeWeight: 4,
      map: map
    });

    // Create drone marker if available
    const flightProgress = tracking.flightProgress || 0;
    let dronePos = pickupPos;
    
    if (droneCoords) {
      dronePos = { lat: droneCoords.lat, lng: droneCoords.lng };
    } else if (flightProgress > 0) {
      // Calculate position based on progress
      dronePos = {
        lat: pickupPos.lat + (deliveryPos.lat - pickupPos.lat) * flightProgress,
        lng: pickupPos.lng + (deliveryPos.lng - pickupPos.lng) * flightProgress
      };
    }

    markersRef.current.drone = new window.google.maps.Marker({
      position: dronePos,
      map: map,
      title: `Drone ${tracking.drone?.droneId || ''}`,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="18" fill="#EA5034" stroke="white" stroke-width="3"/>
              <text x="25" y="32" font-size="22" text-anchor="middle" fill="white">🚁</text>
            </svg>
          `)
      },
      animation: window.google.maps.Animation.BOUNCE
    });

    // Stop bouncing after 2 seconds
    setTimeout(() => {
      if (markersRef.current.drone) {
        markersRef.current.drone.setAnimation(null);
      }
    }, 2000);

    // Create progress polyline (red, showing completed path)
    const progressIndex = Math.floor(flightProgress * routeCoordinates.length);
    const progressPath = routeCoordinates.slice(0, Math.max(progressIndex, 1));
    
    if (progressPath.length > 1) {
      markersRef.current.progressPolyline = new window.google.maps.Polyline({
        path: progressPath,
        geodesic: true,
        strokeColor: '#EA5034',
        strokeOpacity: 1,
        strokeWeight: 6,
        map: map
      });
    }

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(pickupPos);
    bounds.extend(deliveryPos);
    if (dronePos) bounds.extend(dronePos);
    
    map.fitBounds(bounds);
    
    // Adjust zoom after fitting bounds
    const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (map.getZoom() > 15) map.setZoom(15);
    });

  }, [trackingData?.tracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(marker => {
        if (marker) marker.setMap(null);
      });
      mapInstanceRef.current = null;
    };
  }, []);

  if (!orderId) {
    return (
      <div className="order-tracking-page">
        <div className="tracking-container">
          <div className="centered-state">
            <div className="error-icon">⚠️</div>
            <h2>Không tìm thấy thông tin đơn hàng</h2>
            <p>Vui lòng quay lại danh sách đơn hàng và chọn đơn cần theo dõi.</p>
            <button onClick={() => navigate("/orders")} className="retry-btn">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !trackingData) {
    return (
      <div className="order-tracking-page">
        <div className="tracking-container">
          <div className="centered-state">
            <div className="loading-spinner"></div>
            <h2>Đang tải dữ liệu theo dõi...</h2>
            <p>Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(trackingData?.order?.status);
  const statusIndex = STATUS_SEQUENCE.indexOf(normalizedStatus);
  const timelineMap = new Map();
  (trackingData?.order?.timeline || []).forEach((entry) => {
    if (entry?.status) {
      timelineMap.set(entry.status, entry);
    }
  });
  const timelineStatuses = new Set(timelineMap.keys());

  const orderNumber = trackingData?.order?.orderNumber || trackingData?.order?.id || '---';
  const restaurantName = trackingData?.tracking?.pickupLocation?.name || 'Nhà hàng FoodFast';
  const restaurantAddress = trackingData?.tracking?.pickupLocation?.address;
  const deliveryAddress = trackingData?.tracking?.deliveryLocation?.address || 'Đang cập nhật địa chỉ giao hàng';
  const droneInfo = trackingData?.tracking?.drone;
  const droneCode = droneInfo?.droneId || droneInfo?.name || orderNumber.slice(0, 6).toUpperCase();
  const items = trackingData?.order?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const canConfirm = normalizedStatus === 'delivered';
  const timelineUpdatedAt = formatTimestamp(trackingData?.order?.updatedAt);
  const etaValue = trackingData?.tracking?.estimatedArrival ? new Date(trackingData.tracking.estimatedArrival) : null;
  let etaText = '--:--';
  if (etaValue && !isNaN(etaValue.getTime())) {
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((etaValue.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    etaText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="order-tracking-page">
      {/* Header */}
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate("/orders")}>
          <span>←</span>
        </button>
        <h1>Theo dõi đơn hàng</h1>
        <div style={{ width: 22 }}></div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button onClick={() => window.location.reload()} className="retry-link">
            Thử lại
          </button>
        </div>
      )}

      {/* Status Banner */}
      <div className="status-banner">
        <div className="banner-left">
          <div className="banner-label">Mã đơn: #{orderNumber}</div>
          <div className="banner-text">
            🚁
            {normalizedStatus === 'delivering' 
              ? ' Đang giao hàng' 
              : ' Drone đang sẵn sàng'}
          </div>
          <div className="banner-desc">
            {normalizedStatus === 'delivering' 
              ? 'Drone đang giao hàng đến bạn' 
              : 'Đơn hàng của bạn đang được xử lý'}
          </div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="status-steps">
        {STATUS_STEPS.map((step) => {
          const reached = timelineStatuses.has(step.key) || STATUS_SEQUENCE.indexOf(step.key) <= statusIndex;
          return (
            <div key={step.key} className={`status-step ${reached ? 'active' : ''}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Map Section */}
      {normalizedStatus === 'delivering' && (
        <div className="map-section">
          <h3 className="map-title">🚁 Theo dõi drone giao hàng</h3>
          <div className="map-container" id="tracking-map"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="tracking-content">
        {/* Timeline */}
        <div className="timeline-section">
          {STATUS_STEPS.map((step, index) => {
            const reached = timelineStatuses.has(step.key) || index <= statusIndex;
            const nextReached = index < statusIndex;
            const event = timelineMap.get(step.key);
            const timestamp = formatTimestamp(event?.timestamp);
            
            return (
              <div key={step.key} className="timeline-row">
                <div className="timeline-rail">
                  <div className={`timeline-dot ${reached ? 'active' : ''}`}>
                    {reached ? <span>✓</span> : <span className="dot-empty">○</span>}
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`timeline-connector ${nextReached ? 'active' : ''}`}></div>
                  )}
                </div>
                <div className="timeline-content">
                  <div className={`timeline-title ${reached ? 'active' : ''}`}>
                    <span className="timeline-icon">{step.icon}</span>
                    {step.label}
                  </div>
                  <div className="timeline-description">{step.description}</div>
                  {timestamp && <div className="timeline-timestamp">{timestamp}</div>}
                  {event?.note && <div className="timeline-note">{event.note}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details Card */}
        <div className="order-card">
          <h3 className="section-heading">Chi tiết đơn hàng</h3>
          {items.length === 0 ? (
            <p className="empty-order-text">Đang cập nhật danh sách món.</p>
          ) : (
            <>
              {items.slice(0, 10).map((item, index) => (
                <div key={item.id || item.product || index} className="order-row">
                  <span className="order-row-text">
                    {item.name || 'Món ăn'} x{item.quantity}
                  </span>
                  <span className="order-row-price">
                    {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
              <div className="order-summary">
                <div className="summary-row">
                  <span className="summary-label">Tạm tính:</span>
                  <span className="summary-value">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Phí giao hàng:</span>
                  <span className="summary-value">
                    {(trackingData?.order?.shippingFee || 15000).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="summary-row total">
                  <span className="summary-label">Tổng cộng:</span>
                  <span className="summary-value">
                    {(totalAmount + (trackingData?.order?.shippingFee || 15000)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delivery Info */}
        <div className="delivery-info-section">
          <div className="info-row">
            <span className="info-label">📍 Địa chỉ giao:</span>
            <span className="info-value">{deliveryAddress}</span>
          </div>
          <div className="info-row">
            <span className="info-label">📞 Số điện thoại:</span>
            <span className="info-value">{trackingData?.tracking?.deliveryLocation?.phone || '---'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">💳 Thanh toán:</span>
            <span className="info-value">
              {trackingData?.order?.paymentMethod === 'cod' ? 'Tiền mặt' : 'Thanh toán online'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">🕐 Thời gian đặt:</span>
            <span className="info-value">
              {trackingData?.order?.createdAt ? 
                new Date(trackingData.order.createdAt).toLocaleString('vi-VN') : 
                '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="tracking-footer">
        © 2025 FoodFast - Giao hàng bằng Drone
      </div>
    </div>
  );
}

export default OrderTracking;
