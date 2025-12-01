import { useState, useEffect, useRef, useMemo } from "react";
import { orderAPI } from "../../services/api";
import { loadGoogleMaps } from "../../utils/loadGoogleMaps";
import "./OrderMonitoring.css";

// Build route coordinates for smooth polyline
const buildRouteCoordinates = (start, end) => {
  if (!start || !end) return [];
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

// Get coordinate at progress
const getCoordinateAtProgress = (route, progress) => {
  if (!route.length) return route[0] || { lat: 10.776923, lng: 106.700981 };
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

function OrderMonitoring() {
  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedOrder && showModal) {
      fetchTrackingData(selectedOrder._id);
      const interval = setInterval(() => fetchTrackingData(selectedOrder._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedOrder, showModal]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingData = async (orderId) => {
    try {
      const response = await orderAPI.track(orderId);
      if (response?.data) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    }
  };

  const getStatusText = (status) => {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng giao",
      delivering: "Đang giao",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      pending: "#FFA500",
      confirmed: "#2196F3",
      preparing: "#9C27B0",
      ready: "#FF9800",
      delivering: "#f97316",
      delivered: "#4CAF50",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return map[status] || "#999";
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "new") {
      return orders.filter((o) => o.status === "pending");
    }
    if (activeTab === "processing") {
      return orders.filter((o) =>
        ["confirmed", "preparing", "ready", "delivering", "delivered"].includes(o.status)
      );
    }
    return orders;
  }, [orders, activeTab]);

  const tabCounts = useMemo(() => {
    return {
      new: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) =>
        ["confirmed", "preparing", "ready", "delivering", "delivered"].includes(o.status)
      ).length,
      all: orders.length,
    };
  }, [orders]);

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setTrackingData(null);
    if (mapInstanceRef.current) {
      Object.values(markersRef.current).forEach((m) => m?.setMap(null));
      markersRef.current = {};
      mapInstanceRef.current = null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!showModal || !trackingData) return;

    let cancelled = false;
    let timer;

    const initialiseMap = async () => {
      try {
        await loadGoogleMaps();
        if (cancelled) return;

        timer = window.setTimeout(() => {
          const mapContainer = document.getElementById("admin-tracking-map");
          if (!mapContainer) return;

          const pickupCoords = trackingData?.tracking?.pickupLocation?.coordinates || {
            lat: 10.776923,
            lng: 106.700981,
          };
          const dropoffCoords = trackingData?.tracking?.deliveryLocation?.coordinates || {
            lat: 10.782112,
            lng: 106.70917,
          };

          if (!mapInstanceRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapContainer, {
              center: pickupCoords,
              zoom: 14,
              disableDefaultUI: false,
              zoomControl: true,
            });

            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(pickupCoords);
            bounds.extend(dropoffCoords);
            mapInstanceRef.current.fitBounds(bounds);
          }

          const map = mapInstanceRef.current;
          Object.values(markersRef.current).forEach((m) => m?.setMap(null));

          const routeCoords = buildRouteCoordinates(pickupCoords, dropoffCoords);
          const progress = trackingData?.tracking?.flightProgress || 0;
          const dronePos = getCoordinateAtProgress(routeCoords, progress);

          // Pickup marker
          markersRef.current.pickup = new window.google.maps.Marker({
            position: pickupCoords,
            map: map,
            title: "Nhà hàng",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#f97316" stroke="white" stroke-width="3"/>
                  <text x="24" y="29" font-size="14" text-anchor="middle" fill="white">🏪</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            },
          });

          // Delivery marker
          markersRef.current.delivery = new window.google.maps.Marker({
            position: dropoffCoords,
            map: map,
            title: "Điểm giao",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#27AE60" stroke="white" stroke-width="3"/>
                  <text x="24" y="29" font-size="14" text-anchor="middle" fill="white">🏠</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            },
          });

          // Route polyline
          markersRef.current.polyline = new window.google.maps.Polyline({
            path: routeCoords,
            geodesic: true,
            strokeColor: "#94a3b8",
            strokeOpacity: 0,
            strokeWeight: 4,
            icons: [
              {
                icon: { path: "M 0,-1 0,1", strokeOpacity: 0.6, scale: 3 },
                offset: "0",
                repeat: "12px",
              },
            ],
            map: map,
          });

          // Progress polyline
          const progressIndex = Math.ceil(progress * routeCoords.length);
          const progressPath = routeCoords.slice(0, progressIndex);
          if (progressPath.length > 1) {
            markersRef.current.progressPolyline = new window.google.maps.Polyline({
              path: progressPath,
              geodesic: true,
              strokeColor: "#f97316",
              strokeOpacity: 1,
              strokeWeight: 5,
              map: map,
            });
          }

          // Drone marker
          markersRef.current.drone = new window.google.maps.Marker({
            position: dronePos,
            map: map,
            title: "Drone",
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="26" fill="#FFF5F1" opacity="0.9"/>
                  <circle cx="30" cy="30" r="20" fill="#f97316" stroke="white" stroke-width="3"/>
                  <text x="30" y="36" font-size="18" text-anchor="middle" fill="white">🚁</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(60, 60),
              anchor: new window.google.maps.Point(30, 30),
            },
            zIndex: 200,
          });
        }, 100);
      } catch (err) {
        console.error("Không thể tải Google Maps:", err);
      }
    };

    initialiseMap();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showModal, trackingData]);

  if (loading) {
    return (
      <div className="order-monitoring-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="order-monitoring-page">
      <div className="page-header">
        <h1>📦 Giám sát đơn hàng</h1>
        <p className="subtitle">Theo dõi tất cả đơn hàng trong hệ thống</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "new" ? "active" : ""}
          onClick={() => setActiveTab("new")}
        >
          🆕 Đơn mới
          <span className="tab-count">{tabCounts.new}</span>
        </button>
        <button
          className={activeTab === "processing" ? "active" : ""}
          onClick={() => setActiveTab("processing")}
        >
          ⚙️ Đang xử lý
          <span className="tab-count">{tabCounts.processing}</span>
        </button>
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          📋 Tất cả
          <span className="tab-count">{tabCounts.all}</span>
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>#{order.orderNumber}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="order-info">
                <p>
                  <strong>Khách hàng:</strong> {order.customer?.name || order.guestInfo?.name || "Khách"}
                </p>
                <p>
                  <strong>Nhà hàng:</strong> {order.restaurant?.name || "N/A"}
                </p>
                <p>
                  <strong>Tổng tiền:</strong> {order.totalAmount?.toLocaleString("vi-VN")}đ
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button className="track-btn" onClick={() => handleTrackOrder(order)}>
                🗺️ Theo dõi
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Theo dõi đơn #{selectedOrder?.orderNumber}</h2>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="map-container" id="admin-tracking-map"></div>
              {trackingData && (
                <div className="tracking-info">
                  <div className="info-row">
                    <span>Trạng thái:</span>
                    <strong>{getStatusText(trackingData.order?.status)}</strong>
                  </div>
                  <div className="info-row">
                    <span>Tiến độ bay:</span>
                    <strong>
                      {Math.round((trackingData.tracking?.flightProgress || 0) * 100)}%
                    </strong>
                  </div>
                  {trackingData.tracking?.drone && (
                    <div className="info-row">
                      <span>Drone:</span>
                      <strong>{trackingData.tracking.drone.droneId}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderMonitoring;
