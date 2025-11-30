import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderAPI } from "../../services/api";
import "./OrderTracking.css";

// Status steps - customer chỉ thấy đến 'delivered', không thấy 'completed'
const STATUS_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', icon: '⏳', description: 'Đơn hàng đang chờ nhà hàng xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: '✅', description: 'Nhà hàng đã tiếp nhận và chuẩn bị đơn' },
  { key: 'ready', label: 'Sẵn sàng', icon: '📦', description: 'Đơn đã đóng gói, chờ drone tiếp nhận' },
  { key: 'delivering', label: 'Drone đang giao', icon: '🚁', description: 'Drone đang trên đường bay tới vị trí của bạn' },
  { key: 'delivered', label: 'Chờ giao hàng', icon: '📍', description: 'Drone đã đến, vui lòng nhận hàng' },
];

const STATUS_SEQUENCE = STATUS_STEPS.map(step => step.key);

// Default coordinates (HCM City)
const FALLBACK_PICKUP = { lat: 10.776923, lng: 106.700981 };
const FALLBACK_DROPOFF = { lat: 10.782112, lng: 106.70917 };

// Build route coordinates for smooth polyline
const buildRouteCoordinates = (start, end) => {
  if (!start || !end) {
    return [FALLBACK_PICKUP, FALLBACK_DROPOFF];
  }
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t,
    });
  }
  return points;
};

// Calculate bearing for drone rotation
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;

const calculateBearing = (from, to) => {
  if (from.lat === to.lat && from.lng === to.lng) return 0;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

// Get coordinate at progress
const getCoordinateAtProgress = (route, progress) => {
  if (!route.length) return FALLBACK_PICKUP;
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];
  
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const segments = route.length - 1;
  const exactIndex = clampedProgress * segments;
  const segmentIndex = Math.min(Math.floor(exactIndex), segments - 1);
  const segmentProgress = exactIndex - segmentIndex;
  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];
  
  return {
    lat: start.lat + (end.lat - start.lat) * segmentProgress,
    lng: start.lng + (end.lng - start.lng) * segmentProgress,
  };
};

// Normalize status
const normalizeStatus = (status) => {
  if (!status) return 'pending';
  // 'completed' is now a separate step, no conversion needed
  if (status === 'ready_for_delivery') return 'ready';
  if (status === 'preparing') return 'confirmed';
  return status;
};

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    pickup: null,
    delivery: null,
    drone: null,
    polyline: null,
    progressPolyline: null
  });
  const animationRef = useRef(null);

  // Set mapReady after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch tracking data
  const fetchTracking = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

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
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  // Reset acknowledged when status changes
  useEffect(() => {
    const normalizedStatus = normalizeStatus(trackingData?.order?.status);
    if (normalizedStatus !== 'delivered') {
      setAcknowledged(false);
    }
  }, [trackingData?.order?.status]);

  // Computed values
  const normalizedStatus = useMemo(
    () => normalizeStatus(trackingData?.order?.status),
    [trackingData?.order?.status]
  );

  const statusIndex = useMemo(() => {
    const idx = STATUS_SEQUENCE.indexOf(normalizedStatus);
    return idx >= 0 ? idx : 0;
  }, [normalizedStatus]);

  const timelineMap = useMemo(() => {
    const map = new Map();
    (trackingData?.order?.timeline || []).forEach((entry) => {
      if (entry?.status) {
        map.set(entry.status, entry);
      }
    });
    return map;
  }, [trackingData?.order?.timeline]);

  const timelineStatuses = useMemo(() => new Set(timelineMap.keys()), [timelineMap]);

  const pickupCoordinate = useMemo(() => {
    const coords = trackingData?.tracking?.pickupLocation?.coordinates;
    return coords ? { lat: coords.lat, lng: coords.lng } : FALLBACK_PICKUP;
  }, [trackingData?.tracking?.pickupLocation]);

  const dropoffCoordinate = useMemo(() => {
    const coords = trackingData?.tracking?.deliveryLocation?.coordinates;
    return coords ? { lat: coords.lat, lng: coords.lng } : FALLBACK_DROPOFF;
  }, [trackingData?.tracking?.deliveryLocation]);

  const routeCoordinates = useMemo(
    () => buildRouteCoordinates(pickupCoordinate, dropoffCoordinate),
    [pickupCoordinate, dropoffCoordinate]
  );

  const flightProgress = isDemo ? demoProgress : (trackingData?.tracking?.flightProgress || 0);

  const droneCoordinate = useMemo(() => {
    const coords = trackingData?.tracking?.droneLocation;
    if (coords && !isDemo) {
      return { lat: coords.lat, lng: coords.lng };
    }
    return getCoordinateAtProgress(routeCoordinates, flightProgress);
  }, [trackingData?.tracking?.droneLocation, routeCoordinates, flightProgress, isDemo]);

  const routeHeading = useMemo(() => {
    const nextPoint = getCoordinateAtProgress(routeCoordinates, Math.min(flightProgress + 0.02, 1));
    return calculateBearing(droneCoordinate, nextPoint);
  }, [routeCoordinates, flightProgress, droneCoordinate]);

  // Initialize Google Maps (only once)
  useEffect(() => {
    if (!mapReady || loading || !trackingData) {
      return;
    }

    if (!window.google) {
      console.warn('[Map] Google Maps API not loaded');
      return;
    }

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('tracking-map');
      if (!mapContainer || mapInstanceRef.current) return;

      console.log('[Map] Creating new map instance');
      mapInstanceRef.current = new window.google.maps.Map(mapContainer, {
        center: pickupCoordinate,
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        ]
      });

      // Fit bounds once
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoordinate);
      bounds.extend(dropoffCoordinate);
      mapInstanceRef.current.fitBounds(bounds);
      
      window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 15) mapInstanceRef.current.setZoom(15);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [mapReady, loading, trackingData, pickupCoordinate, dropoffCoordinate]);

  // Update markers and polylines when progress changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Clear old markers
    if (markersRef.current.pickup) markersRef.current.pickup.setMap(null);
    if (markersRef.current.delivery) markersRef.current.delivery.setMap(null);
    if (markersRef.current.drone) markersRef.current.drone.setMap(null);
    if (markersRef.current.polyline) markersRef.current.polyline.setMap(null);
    if (markersRef.current.progressPolyline) markersRef.current.progressPolyline.setMap(null);

    // Create pickup marker (restaurant)
    markersRef.current.pickup = new window.google.maps.Marker({
      position: pickupCoordinate,
      map: map,
      title: trackingData?.tracking?.pickupLocation?.name || 'Nhà hàng',
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="56" height="56" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="24" fill="#FFEAE6" opacity="0.8"/>
            <circle cx="28" cy="28" r="18" fill="#f97316" stroke="white" stroke-width="3"/>
            <text x="28" y="34" font-size="16" text-anchor="middle" fill="white">🏪</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(56, 56),
        anchor: new window.google.maps.Point(28, 28)
      },
      zIndex: 100
    });

    // Create delivery marker (home)
    markersRef.current.delivery = new window.google.maps.Marker({
      position: dropoffCoordinate,
      map: map,
      title: 'Điểm giao hàng',
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="56" height="56" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="24" fill="#E8F8EF" opacity="0.8"/>
            <circle cx="28" cy="28" r="18" fill="#27AE60" stroke="white" stroke-width="3"/>
            <text x="28" y="34" font-size="16" text-anchor="middle" fill="white">🏠</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(56, 56),
        anchor: new window.google.maps.Point(28, 28)
      },
      zIndex: 100
    });

    // Create full route polyline (dashed - remaining path)
    markersRef.current.polyline = new window.google.maps.Polyline({
      path: routeCoordinates,
      geodesic: true,
      strokeColor: '#94a3b8',
      strokeOpacity: 0,
      strokeWeight: 4,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 0.6,
          scale: 3
        },
        offset: '0',
        repeat: '12px'
      }],
      map: map
    });

    // Create progress polyline (solid orange - completed path)
    const progressIndex = Math.max(1, Math.ceil(flightProgress * routeCoordinates.length));
    const progressPath = routeCoordinates.slice(0, progressIndex);
    
    if (progressPath.length > 1) {
      markersRef.current.progressPolyline = new window.google.maps.Polyline({
        path: progressPath,
        geodesic: true,
        strokeColor: '#f97316',
        strokeOpacity: 1,
        strokeWeight: 5,
        map: map
      });
    }

    // Get current drone position
    const currentDronePos = getCoordinateAtProgress(routeCoordinates, flightProgress);

    // Create drone marker
    markersRef.current.drone = new window.google.maps.Marker({
      position: currentDronePos,
      map: map,
      title: `Drone ${trackingData?.tracking?.drone?.droneId || ''}`,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="70" height="70" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="35" r="32" fill="#FFF5F1" opacity="0.9"/>
            <circle cx="35" cy="35" r="22" fill="#f97316" stroke="white" stroke-width="3"/>
            <text x="35" y="42" font-size="20" text-anchor="middle" fill="white">🚁</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(70, 70),
        anchor: new window.google.maps.Point(35, 35)
      },
      zIndex: 200
    });

  }, [pickupCoordinate, dropoffCoordinate, routeCoordinates, flightProgress, trackingData]);

  // Demo animation - Simulate drone flying
  const startDemo = useCallback(() => {
    if (isDemo) return;
    
    setIsDemo(true);
    setDemoProgress(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const duration = 15000; // 15 seconds for full demo
    const startTime = Date.now();

    const animate = async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setDemoProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Demo completed - drone arrived, update to delivered status
        setIsDemo(false);
        try {
          console.log('🚁 Drone arrived, updating to delivered status');
          await orderAPI.confirmDelivery(orderId);
          await fetchTracking();
          console.log('✅ Order status updated to delivered');
        } catch (err) {
          console.error('Failed to confirm delivery:', err);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isDemo, orderId, fetchTracking]);

  // Auto-start demo drone when status changes to 'delivering'
  useEffect(() => {
    if (normalizedStatus === 'delivering' && !isDemo && demoProgress === 0 && mapInstanceRef.current) {
      console.log('🚁 Auto-starting drone delivery animation');
      const timer = setTimeout(() => {
        startDemo();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [normalizedStatus, isDemo, demoProgress, startDemo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      Object.values(markersRef.current).forEach(marker => {
        if (marker) marker.setMap(null);
      });
      mapInstanceRef.current = null;
    };
  }, []);

  const handleConfirm = async () => {
    try {
      // Call API to complete order (customer confirmed receiving)
      await orderAPI.complete(orderId);
      setAcknowledged(true);
      alert('🎉 Cảm ơn bạn! Đơn hàng đã hoàn thành.');
      // Refresh data to show updated status
      await fetchTracking();
    } catch (err) {
      console.error('Failed to complete order:', err);
      alert('Không thể xác nhận. Vui lòng thử lại.');
    }
  };

  // Loading state
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

  const orderNumber = trackingData?.order?.orderNumber || trackingData?.order?.id || '---';
  const restaurantName = trackingData?.tracking?.pickupLocation?.name || 'Nhà hàng FoodFast';
  const deliveryAddress = trackingData?.tracking?.deliveryLocation?.address || 'Đang cập nhật địa chỉ giao hàng';
  const droneInfo = trackingData?.tracking?.drone;
  const droneCode = droneInfo?.droneId || droneInfo?.name || orderNumber.slice(0, 6).toUpperCase();
  const items = trackingData?.order?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const canConfirm = normalizedStatus === 'delivered';
  // Customer never sees 'completed' status, it's handled on restaurant side
  
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
        <h1>🚁 Theo dõi đơn hàng</h1>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button onClick={fetchTracking} className="retry-link">
            Thử lại
          </button>
        </div>
      )}

      {/* Status Banner */}
      <div className="status-banner">
        <div className="banner-left">
          <div className="banner-label">MÃ ĐƠN: #{orderNumber}</div>
          <div className="banner-text">
            🚁 {normalizedStatus === 'delivering' ? 'Drone đang sẵn sàng' : 'Drone đang sẵn sàng'}
          </div>
          <div className="banner-desc">
            Đơn hàng của bạn đang được xử lý
          </div>
        </div>
      </div>

      {/* Status Steps - Horizontal like mobile */}
      <div className="status-steps-container">
        <div className="status-steps">
          {STATUS_STEPS.map((step, index) => {
            const reached = timelineStatuses.has(step.key) || index <= statusIndex;
            const isCurrent = index === statusIndex;
            return (
              <div key={step.key} className={`status-step ${reached ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">{step.icon}</div>
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Section - Always show like mobile */}
      <div className="map-section">
        <div className="map-container" id="tracking-map"></div>
        
        {/* Map Badge */}
        <div className="map-badge">
          <span className="badge-icon">📍</span>
          <div className="badge-content">
            <div className="badge-label">Điểm giao</div>
            <div className="badge-text">{deliveryAddress}</div>
          </div>
        </div>

        {/* Flight Progress Bar - Show when delivering */}
        {(normalizedStatus === 'delivering' || isDemo) && (
          <div className="flight-progress-container">
            <div className="flight-progress-info">
              <span className="flight-icon">🚁</span>
              <span className="flight-text">
                {flightProgress >= 1 ? 'Đã đến điểm giao!' : 'Drone đang bay...'}
              </span>
              <span className="flight-percent">{Math.round(flightProgress * 100)}%</span>
            </div>
            <div className="flight-progress-bar">
              <div 
                className="flight-progress-fill" 
                style={{ width: `${flightProgress * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Demo Button - Only show when NOT delivering */}
        {normalizedStatus !== 'delivering' && (
          <button className="demo-btn" onClick={startDemo} disabled={isDemo}>
            {isDemo ? `Demo: ${Math.round(demoProgress * 100)}%` : '🎬 Demo drone bay'}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="tracking-content">
        {/* Order Summary */}
        <div className="summary-header">
          <div className="summary-left">
            <div className="order-code">#{orderNumber}</div>
            <div className="restaurant-name">{restaurantName}</div>
            <div className="delivery-address">{deliveryAddress}</div>
          </div>
          <div className="eta-pill">
            <span className="eta-icon">⏱</span>
            <span className="eta-text">{etaText}</span>
          </div>
        </div>

        {/* Timeline - Vertical like mobile */}
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
                    {reached ? <span>✓</span> : <span className="dot-empty"></span>}
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
                  {timestamp && <div className="timeline-timestamp">⏰ {timestamp}</div>}
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
              {items.slice(0, 5).map((item, index) => (
                <div key={item.id || item.product || index} className="order-row">
                  <span className="order-row-text">
                    {item.quantity}x {item.name || 'Món ăn'}
                  </span>
                  <span className="order-row-price">
                    {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
              {items.length > 5 && (
                <div className="more-items">và {items.length - 5} món khác</div>
              )}
              <div className="total-row">
                <span className="total-label">Tổng cộng</span>
                <span className="total-value">{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </>
          )}
        </div>

        {/* Handover Card */}
        <div className="handover-card">
          <div className="handover-header">
            <span className="handover-icon">🛡️</span>
            <h3 className="section-heading">Xác nhận nhận hàng</h3>
          </div>
          <p className="handover-text">
            Khi drone hạ cánh, hãy kiểm tra khoang chứa. Nhấn "Tôi đã nhận hàng" để xác nhận với hệ thống.
          </p>
          <button
            className={`confirm-btn ${(!canConfirm || acknowledged) ? 'disabled' : ''}`}
            disabled={!canConfirm || acknowledged}
            onClick={handleConfirm}
          >
            {acknowledged ? '✓ Đã xác nhận' : 'Tôi đã nhận hàng'}
          </button>
          <p className="pin-note">
            {canConfirm 
              ? 'Nhấn nút trên để xác nhận bạn đã nhận hàng từ drone.' 
              : 'Nút xác nhận sẽ xuất hiện khi drone đã giao hàng.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
