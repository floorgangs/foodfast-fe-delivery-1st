import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const HANOI_CENTER = { lat: 21.0285, lng: 105.8542 };

function DroneMap({ order, deliveryInfo }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [droneMarker, setDroneMarker] = useState(null);
  const [restaurantMarker, setRestaurantMarker] = useState(null);
  const [customerMarker, setCustomerMarker] = useState(null);
  const [path, setPath] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: HANOI_CENTER,
      zoom: 13,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(mapInstance);
  }, []);

  // Add markers and path when map is ready
  useEffect(() => {
    if (!map || !order) return;

    // Helper to validate coordinates
    const isValidCoordinate = (coord) => {
      return (
        coord &&
        typeof coord.lat === "number" &&
        typeof coord.lng === "number" &&
        !isNaN(coord.lat) &&
        !isNaN(coord.lng) &&
        isFinite(coord.lat) &&
        isFinite(coord.lng)
      );
    };

    // Restaurant location (pickup)
    let restaurantLocation = HANOI_CENTER;
    if (order.restaurant?.location?.coordinates) {
      const coords = order.restaurant.location.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        restaurantLocation = { lat: coords[1], lng: coords[0] };
      } else if (coords.lat != null && coords.lng != null) {
        restaurantLocation = { lat: coords.lat, lng: coords.lng };
      }
    }
    if (!isValidCoordinate(restaurantLocation)) {
      restaurantLocation = HANOI_CENTER;
    }

    // Customer location (delivery)
    let customerLocation = {
      lat: HANOI_CENTER.lat + 0.02,
      lng: HANOI_CENTER.lng + 0.02,
    };
    if (order.deliveryAddress?.coordinates) {
      const coords = order.deliveryAddress.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        customerLocation = { lat: coords[1], lng: coords[0] };
      } else if (coords.lat != null && coords.lng != null) {
        customerLocation = { lat: coords.lat, lng: coords.lng };
      }
    }
    if (!isValidCoordinate(customerLocation)) {
      customerLocation = {
        lat: HANOI_CENTER.lat + 0.02,
        lng: HANOI_CENTER.lng + 0.02,
      };
    }

    // Create restaurant marker
    if (restaurantMarker) restaurantMarker.setMap(null);
    const newRestaurantMarker = new window.google.maps.Marker({
      position: restaurantLocation,
      map: map,
      title: order.restaurant?.name || "Nhà hàng",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" fill="#FF6B35" stroke="white" stroke-width="3"/>
            <text x="20" y="27" font-size="18" text-anchor="middle" fill="white">🏪</text>
          </svg>
        `),
      },
    });
    setRestaurantMarker(newRestaurantMarker);

    // Create customer marker
    if (customerMarker) customerMarker.setMap(null);
    const newCustomerMarker = new window.google.maps.Marker({
      position: customerLocation,
      map: map,
      title: "Địa chỉ giao hàng",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" fill="#4CAF50" stroke="white" stroke-width="3"/>
            <text x="20" y="27" font-size="18" text-anchor="middle" fill="white">🏠</text>
          </svg>
        `),
      },
    });
    setCustomerMarker(newCustomerMarker);

    // Create path line
    if (path) path.setMap(null);
    const newPath = new window.google.maps.Polyline({
      path: [restaurantLocation, customerLocation],
      geodesic: true,
      strokeColor: "#2196F3",
      strokeOpacity: 0.5,
      strokeWeight: 3,
      map: map,
    });
    setPath(newPath);

    // Create drone marker only if order is delivering
    if (order.status === "delivering" || order.status === "picked_up") {
      let droneLocation = restaurantLocation; // Start from restaurant if no location yet

      if (deliveryInfo?.drone?.currentLocation?.coordinates) {
        const coords = deliveryInfo.drone.currentLocation.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          droneLocation = { lat: coords[1], lng: coords[0] };
        } else if (coords.lat != null && coords.lng != null) {
          droneLocation = { lat: coords.lat, lng: coords.lng };
        }
      }

      if (!isValidCoordinate(droneLocation)) {
        droneLocation = restaurantLocation;
      }

      if (droneMarker) droneMarker.setMap(null);
      const newDroneMarker = new window.google.maps.Marker({
        position: droneLocation,
        map: map,
        title: `Drone ${deliveryInfo?.drone?.model || ""}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="18" fill="#2196F3" stroke="white" stroke-width="3"/>
              <text x="25" y="32" font-size="22" text-anchor="middle" fill="white">🚁</text>
            </svg>
          `),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });
      setDroneMarker(newDroneMarker);

      // Stop bouncing after 2 seconds
      setTimeout(() => {
        if (newDroneMarker) {
          newDroneMarker.setAnimation(null);
        }
      }, 2000);
    }

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(restaurantLocation);
    bounds.extend(customerLocation);
    map.fitBounds(bounds);
    map.setZoom(Math.min(map.getZoom(), 14));
  }, [map, order, deliveryInfo]);

  // Update drone position in real-time
  useEffect(() => {
    if (!droneMarker || !deliveryInfo?.drone?.currentLocation) return;

    const droneLocation = {
      lat: deliveryInfo.drone.currentLocation.coordinates[1],
      lng: deliveryInfo.drone.currentLocation.coordinates[0],
    };

    // Smooth animation
    droneMarker.setPosition(droneLocation);
  }, [droneMarker, deliveryInfo?.drone?.currentLocation]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "400px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

DroneMap.propTypes = {
  order: PropTypes.object.isRequired,
  deliveryInfo: PropTypes.object,
};

export default DroneMap;
