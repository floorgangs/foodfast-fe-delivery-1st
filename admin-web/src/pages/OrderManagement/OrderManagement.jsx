import { useState, useEffect, useRef, useCallback } from "react";
import { orderAPI, restaurantAPI, droneAPI } from "../../services/api";
import "./OrderManagement.css";

function OrderManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [returnProgress, setReturnProgress] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const animationRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load restaurants từ API
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Load orders từ API
  useEffect(() => {
    loadOrders();
  }, []);

  // Fetch tracking data when modal opens
  useEffect(() => {
    if (selectedOrder && showTrackingModal) {
      const fetchTracking = async () => {
        try {
          const response = await orderAPI.track(selectedOrder.id);
          if (response?.data) {
            setTrackingData(response.data);
          }
        } catch (error) {
          console.error("Error fetching tracking:", error);
        }
      };
      fetchTracking();
      const interval = setInterval(fetchTracking, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedOrder, showTrackingModal]);

  // Initialize map
  useEffect(() => {
    if (!showTrackingModal || !trackingData || !window.google) return;

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById("admin-order-tracking-map");
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

    return () => clearTimeout(timer);
  }, [showTrackingModal, trackingData]);

  // Update drone position when returning
  useEffect(() => {
    if (!isReturning || returnProgress === 0 || !trackingData || !mapInstanceRef.current) return;

    const pickupCoords = trackingData?.tracking?.pickupLocation?.coordinates || {
      lat: 10.776923,
      lng: 106.700981,
    };
    const dropoffCoords = trackingData?.tracking?.deliveryLocation?.coordinates || {
      lat: 10.782112,
      lng: 106.70917,
    };

    // When returning, drone goes from dropoff back to pickup
    const returnRouteCoords = buildRouteCoordinates(dropoffCoords, pickupCoords);
    const dronePos = getCoordinateAtProgress(returnRouteCoords, returnProgress);

    // Update drone marker position
    if (markersRef.current.drone) {
      markersRef.current.drone.setPosition(dronePos);
    }

    // Update return progress polyline (orange line from delivery to current position)
    if (markersRef.current.returnPolyline) {
      markersRef.current.returnPolyline.setMap(null);
    }
    
    const progressIndex = Math.ceil(returnProgress * returnRouteCoords.length);
    const returnPath = returnRouteCoords.slice(0, progressIndex);
    if (returnPath.length > 1) {
      markersRef.current.returnPolyline = new window.google.maps.Polyline({
        path: returnPath,
        geodesic: true,
        strokeColor: "#22c55e", // Green for return path
        strokeOpacity: 1,
        strokeWeight: 5,
        map: mapInstanceRef.current,
      });
    }
  }, [returnProgress, isReturning, trackingData]);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAllRestaurants();
      if (response.success && response.data) {
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("=== Loading all orders from API for admin");

      // Admin lấy tất cả orders từ backend
      const response = await orderAPI.getAllOrders();
      console.log("API response:", response);

      if (response.success && response.data) {
        // Transform data sang format của OrderManagement
        const transformedOrders = response.data.map((order) => {
          const restaurantName = order.restaurant?.name || "Nhà hàng không xác định";
          const totalAmount = order.totalAmount || 0;

          // Handle address - có thể là string hoặc object
          let addressStr = "";
          if (typeof order.deliveryAddress === "string") {
            addressStr = order.deliveryAddress;
          } else if (order.deliveryAddress && typeof order.deliveryAddress === "object") {
            const addr = order.deliveryAddress;
            addressStr = [addr.address, addr.ward, addr.district, addr.city]
              .filter(Boolean)
              .join(", ");
          }

          return {
            id: order._id,
            restaurantId: order.restaurant?._id || "",
            restaurantName: restaurantName,
            customer: order.customer?.name || order.guestInfo?.name || "Khách vãng lai",
            phone: order.customer?.phone || order.guestInfo?.phone || order.deliveryAddress?.phone || "",
            address: addressStr,
            items: order.items?.map((item) => ({
              name: item.product?.name || item.name || "Sản phẩm",
              quantity: item.quantity || 1,
              price: item.price || 0,
            })) || [],
            total: totalAmount,
            discount: order.discount || 0,
            platformFee: Math.round(totalAmount * 0.1), // 10% platform fee
            restaurantReceives: totalAmount - Math.round(totalAmount * 0.1),
            distance: order.distance || 0,
            status: order.status || "pending",
            time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
            note: order.note || "",
            paymentMethod: order.paymentMethod || "PayPal",
            paymentStatus: order.paymentStatus || "pending",
          };
        });

        console.log("Transformed orders:", transformedOrders.length);
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Không thể tải đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    console.log("Updating order status:", id, newStatus);

    try {
      const response = await orderAPI.updateOrderStatus(id, newStatus);

      if (response.success) {
        // Reload orders
        loadOrders();
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleTrackOrder = async (order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
    // Fetch tracking data
    try {
      const response = await orderAPI.track(order.id);
      if (response?.data) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    }
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setSelectedOrder(null);
    setTrackingData(null);
    if (mapInstanceRef.current) {
      Object.values(markersRef.current).forEach((m) => m?.setMap(null));
      markersRef.current = {};
      mapInstanceRef.current = null;
    }
  };

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

  const getStatusText = (status) => {
    const map = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng giao",
      delivering: "Đang giao",
      delivered: "Đã giao",
      returning: "Drone đang về",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  // Start drone return animation
  const startDroneReturn = useCallback(async () => {
    if (isReturning) return;
    
    setIsReturning(true);
    setReturnProgress(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const duration = 10000; // 10 seconds for return
    const startTime = Date.now();

    const animate = async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setReturnProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Drone returned - update drone status to available
        setIsReturning(false);
        try {
          console.log('🚁 Drone returned, marking order as completed');
          
          // Update order status to completed
          if (selectedOrder) {
            await orderAPI.updateOrderStatus(selectedOrder.id, 'completed');
          }
          
          // Update drone status to available
          if (trackingData?.tracking?.drone?._id) {
            await droneAPI.updateDrone(trackingData.tracking.drone._id, { 
              status: 'available',
              batteryLevel: Math.max(20, (trackingData.tracking.drone.batteryLevel || 100) - 20)
            });
          }
          
          alert('✅ Drone đã về nhà hàng! Đơn hàng hoàn thành.');
          closeTrackingModal();
          loadOrders();
        } catch (err) {
          console.error('Failed to complete order:', err);
          alert('Lỗi khi cập nhật trạng thái đơn hàng');
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isReturning, selectedOrder, trackingData]);

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter theo nhà hàng
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (order) => order.restaurantId === selectedRestaurant
      );
    }

    // Filter theo tab
    switch (activeTab) {
      case "active":
        return filtered.filter((order) =>
          ["pending", "confirmed", "preparing", "ready", "delivering"].includes(order.status)
        );
      case "delivered":
        return filtered.filter((order) => order.status === "delivered");
      case "completed":
        return filtered.filter((order) => order.status === "completed");
      case "cancelled":
        return filtered.filter((order) => order.status === "cancelled");
      default:
        return filtered;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Tính toán số lượng cho từng tab (theo nhà hàng được chọn)
  const getTabCounts = () => {
    let filtered = orders;
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (order) => order.restaurantId === selectedRestaurant
      );
    }

    return {
      active: filtered.filter((o) =>
        ["pending", "confirmed", "preparing", "ready", "delivering"].includes(o.status)
      ).length,
      delivered: filtered.filter((o) => o.status === "delivered").length,
      completed: filtered.filter((o) => o.status === "completed").length,
      cancelled: filtered.filter((o) => o.status === "cancelled").length,
    };
  };

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="order-management-page">
        <div className="page-header">
          <h1>Quản lý đơn hàng</h1>
          <p className="subtitle">Đang tải dữ liệu...</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management-page">
        <div className="page-header">
          <h1>Quản lý đơn hàng</h1>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadOrders} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management-page">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <p className="subtitle">Quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Restaurant filter */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả nhà hàng</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={loadOrders} className="refresh-btn">
          🔄 Làm mới
        </button>
      </div>

      <div className="order-tabs">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          📦 Đang xử lý
          <span className="tab-count">{tabCounts.active}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "delivered" ? "active" : ""}`}
          onClick={() => setActiveTab("delivered")}
        >
          🚁 Đã giao
          <span className="tab-count">{tabCounts.delivered}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          ✅ Hoàn thành
          <span className="tab-count">{tabCounts.completed}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          ❌ Đã hủy
          <span className="tab-count">{tabCounts.cancelled}</span>
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
            >
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">Đơn #{order.id}</span>
                  <span className="restaurant-name">
                    🏪 {order.restaurantName}
                  </span>
                  <span className="customer-name">👤 {order.customer}</span>
                </div>
                <span className={`status-badge ${order.status}`}>
                  {order.status === "pending" && "Chờ xác nhận"}
                  {order.status === "confirmed" && "Đã xác nhận"}
                  {order.status === "preparing" && "Đang chuẩn bị"}
                  {order.status === "ready" && "Sẵn sàng"}
                  {order.status === "delivering" && "Đang giao"}
                  {order.status === "delivered" && "Đã giao"}
                  {order.status === "completed" && "Hoàn thành"}
                  {order.status === "cancelled" && "Đã hủy"}
                </span>
              </div>

              <div className="order-details">
                <p className="order-items">
                  {order.items
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ")}
                </p>
              </div>

              <div className="order-footer">
                <div className="order-footer-info">
                  <span className="order-time">🕐 {order.time}</span>
                  <span className="order-date">📅 {order.date}</span>
                  <span className="order-total">
                    {order.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <button 
                  className="track-order-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackOrder(order);
                  }}
                >
                  🗺️ Theo dõi
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Thông tin nhà hàng</h3>
                <div className="info-row">
                  <span className="label">Nhà hàng:</span>
                  <span className="value">{selectedOrder.restaurantName}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="info-row">
                  <span className="label">Tên khách hàng:</span>
                  <span className="value">{selectedOrder.customer}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedOrder.phone}</span>
                </div>
                <div className="info-row">
                  <span className="label">Địa chỉ giao hàng:</span>
                  <span className="value">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="info-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">#{selectedOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian đặt:</span>
                  <span className="value">
                    {selectedOrder.time} - {selectedOrder.date}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Khoảng cách:</span>
                  <span className="value">{selectedOrder.distance} km</span>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${selectedOrder.status}`}>
                    {selectedOrder.status === "pending" && "Chờ xác nhận"}
                    {selectedOrder.status === "confirmed" && "Đã xác nhận"}
                    {selectedOrder.status === "preparing" && "Đang chuẩn bị"}
                    {selectedOrder.status === "delivering" && "Đang giao"}
                    {selectedOrder.status === "completed" && "Hoàn thành"}
                    {selectedOrder.status === "cancelled" && "Đã hủy"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phương thức thanh toán:</span>
                  <span className="value">{selectedOrder.paymentMethod}</span>
                </div>
                {selectedOrder.note && (
                  <div className="info-row">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedOrder.note}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Chi tiết món ăn</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
                <div className="financial-summary">
                  <div className="summary-row">
                    <span className="summary-label">Tổng tiền:</span>
                    <span className="summary-value">
                      {selectedOrder.total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Giảm giá:</span>
                    <span className="summary-value discount">
                      -{selectedOrder.discount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">
                      Chiết khấu nền tảng (10%):
                    </span>
                    <span className="summary-value fee">
                      -{selectedOrder.platformFee.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Quán phải thu:</span>
                    <span className="total-value">
                      {selectedOrder.restaurantReceives.toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrackingModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Theo dõi đơn #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={closeTrackingModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="map-container" id="admin-order-tracking-map"></div>
              {trackingData && (
                <div className="tracking-info">
                  <div className="info-section">
                    <h3>Trạng thái đơn hàng</h3>
                    <div className="status-display">
                      <span className={`status-badge ${isReturning ? 'returning' : trackingData.order?.status}`}>
                        {isReturning ? '🚁 Drone đang về nhà hàng' : getStatusText(trackingData.order?.status)}
                      </span>
                    </div>
                  </div>
                  
                  {trackingData.tracking && (
                    <>
                      {/* Progress bar cho giao hàng hoặc về nhà hàng */}
                      <div className="info-section">
                        <h3>{isReturning ? 'Tiến độ về nhà hàng' : 'Tiến độ giao hàng'}</h3>
                        <div className={`progress-bar ${isReturning ? 'returning' : ''}`}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${isReturning 
                                ? returnProgress * 100 
                                : (trackingData.tracking.flightProgress || 0) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <p className="progress-text">
                          {isReturning 
                            ? `${Math.round(returnProgress * 100)}% - Drone đang bay về`
                            : `${Math.round((trackingData.tracking.flightProgress || 0) * 100)}% hoàn thành`
                          }
                        </p>
                      </div>

                      {trackingData.tracking.drone && (
                        <div className="info-section">
                          <h3>Thông tin Drone</h3>
                          <div className="info-row">
                            <span>Mã Drone:</span>
                            <strong>{trackingData.tracking.drone.droneId}</strong>
                          </div>
                          <div className="info-row">
                            <span>Pin:</span>
                            <strong>{trackingData.tracking.drone.batteryLevel || 100}%</strong>
                          </div>
                        </div>
                      )}

                      <div className="info-section">
                        <h3>Địa chỉ giao hàng</h3>
                        <p className="address-text">{selectedOrder.address}</p>
                      </div>

                      {/* Nút cho drone bay về khi đã giao */}
                      {selectedOrder.status === 'delivered' && !isReturning && (
                        <div className="return-action">
                          <p className="return-info">📍 Khách hàng đã nhận hàng. Click để drone bay về nhà hàng.</p>
                          <button 
                            className="return-btn"
                            onClick={startDroneReturn}
                          >
                            🚁 Bắt đầu bay về nhà hàng
                          </button>
                        </div>
                      )}

                      {isReturning && (
                        <div className="return-action returning">
                          <p className="return-info">🚁 Drone đang bay về nhà hàng... Vui lòng đợi.</p>
                        </div>
                      )}
                    </>
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

export default OrderManagement;
