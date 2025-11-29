import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { LatLng, Marker, Polyline, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { orderAPI } from '../services/api';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;

const STATUS_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận', description: 'Đơn hàng đang chờ nhà hàng xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận', description: 'Nhà hàng đã tiếp nhận và chuẩn bị đơn' },
  { key: 'ready', label: 'Sẵn sàng giao', description: 'Đơn đã đóng gói, chờ drone tiếp nhận' },
  { key: 'delivering', label: 'Drone đang giao', description: 'Drone đang trên đường bay tới vị trí của bạn' },
  { key: 'delivered', label: 'Đã giao', description: 'Bạn đã nhận được đơn hàng' },
] as const;

const STATUS_SEQUENCE = STATUS_STEPS.map(step => step.key);

const FALLBACK_PICKUP: LatLng = { latitude: 10.776923, longitude: 106.700981 };
const FALLBACK_DROPOFF: LatLng = { latitude: 10.782112, longitude: 106.70917 };

const MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5f4d7' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fbe9e7' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d4e4fb' }],
  },
];

const buildRouteCoordinates = (start: LatLng, end: LatLng): LatLng[] => {
  if (!start || !end) {
    return [FALLBACK_PICKUP, FALLBACK_DROPOFF];
  }

  const points: LatLng[] = [];
  const steps = 30;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }

  return points;
};

const computeRegionFromRoute = (coordinates: LatLng[]): Region => {
  if (!coordinates.length) {
    return {
      latitude: FALLBACK_PICKUP.latitude,
      longitude: FALLBACK_PICKUP.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };
  }

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  coordinates.forEach(point => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const paddingLat = Math.max((maxLat - minLat) * 0.6, 0.01);
  const paddingLng = Math.max((maxLng - minLng) * 0.6, 0.01);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) + paddingLat,
    longitudeDelta: (maxLng - minLng) + paddingLng,
  };
};

const getCoordinateAtProgress = (route: LatLng[], progress: number): LatLng => {
  if (!route.length) {
    return FALLBACK_PICKUP;
  }

  if (progress <= 0) {
    return route[0];
  }

  if (progress >= 1) {
    return route[route.length - 1];
  }

  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const segments = route.length - 1;
  const exactIndex = clampedProgress * segments;
  const segmentIndex = Math.min(Math.floor(exactIndex), segments - 1);
  const segmentProgress = exactIndex - segmentIndex;
  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];

  return {
    latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
    longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
  };
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const calculateBearing = (from: LatLng, to: LatLng): number => {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0;
  }

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  const bearing = toDegrees(Math.atan2(y, x));

  return (bearing + 360) % 360;
};

const buildProgressPolyline = (route: LatLng[], progress: number): LatLng[] => {
  if (!route.length) {
    return [];
  }

  const clamped = Math.max(0, Math.min(progress, 1));
  if (clamped === 0) {
    return [];
  }

  const segments = route.length - 1;
  if (segments <= 0) {
    return [...route];
  }

  const target = clamped * segments;
  const polyline: LatLng[] = [route[0]];

  for (let i = 0; i < segments; i += 1) {
    const start = route[i];
    const end = route[i + 1];

    if (target >= i + 1) {
      polyline.push(end);
      continue;
    }

    if (target > i) {
      const segmentProgress = target - i;
      polyline.push({
        latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
        longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
      });
    }

    break;
  }

  return polyline;
};

type CoordinatePayload = {
  lat: number;
  lng: number;
};

type DroneCoordinatePayload = CoordinatePayload & {
  heading?: number;
  updatedAt?: string;
};

interface TrackingTimelineEntry {
  status: string;
  timestamp?: string;
  note?: string;
}

interface TrackingItem {
  id?: string;
  product?: string;
  name?: string;
  quantity: number;
  price?: number;
}

interface TrackingPayload {
  order: {
    id: string;
    orderNumber?: string;
    status: string;
    timeline: TrackingTimelineEntry[];
    paymentStatus?: string;
    createdAt?: string;
    updatedAt?: string;
    items: TrackingItem[];
  };
  tracking: {
    pickupLocation?: {
      name?: string;
      address?: string;
      coordinates?: CoordinatePayload | null;
    };
    deliveryLocation?: {
      address?: string;
      coordinates?: CoordinatePayload | null;
    };
    droneLocation?: DroneCoordinatePayload | null;
    progress?: number;
    flightProgress?: number;
    estimatedArrival?: string;
    updatedAt?: string;
    drone?: {
      id?: string;
      droneId?: string;
      name?: string;
      model?: string;
      status?: string;
      batteryLevel?: number;
    } | null;
  };
}

const normalizeStatus = (status?: string): string => {
  if (!status) return 'pending';
  if (status === 'completed') return 'delivered';
  return status;
};

const toLatLng = (coordinate?: CoordinatePayload | null): LatLng | null => {
  if (!coordinate || typeof coordinate.lat !== 'number' || typeof coordinate.lng !== 'number') {
    return null;
  }

  return {
    latitude: coordinate.lat,
    longitude: coordinate.lng,
  };
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return null;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const OrderTrackingScreen = ({ navigation, route }: any) => {
  const { orderId } = route?.params ?? {};
  const mapRef = useRef<MapView | null>(null);
  const cameraReadyRef = useRef<boolean>(false);
  const [trackingData, setTrackingData] = useState<TrackingPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const fetchTracking = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    try {
      const response = await orderAPI.track(orderId);
      if (response?.data) {
        setTrackingData(response.data as TrackingPayload);
        setError(null);
      } else {
        setError('Không nhận được dữ liệu theo dõi');
      }
    } catch (err: any) {
      console.error('[OrderTracking] fetch error:', err);
      setError(err.message || 'Không thể tải dữ liệu theo dõi');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      fetchTracking();
      const interval = setInterval(fetchTracking, 10000);
      return () => clearInterval(interval);
    }, [fetchTracking])
  );

  useEffect(() => {
    cameraReadyRef.current = false;
  }, [orderId]);

  const normalizedStatus = useMemo(
    () => normalizeStatus(trackingData?.order?.status),
    [trackingData?.order?.status]
  );

  useEffect(() => {
    if (normalizedStatus !== 'delivered') {
      setAcknowledged(false);
    }
  }, [normalizedStatus]);

  const statusIndex = useMemo(() => {
    const idx = STATUS_SEQUENCE.indexOf(normalizedStatus);
    return idx >= 0 ? idx : 0;
  }, [normalizedStatus]);

  const timelineMap = useMemo(() => {
    const map = new Map<string, TrackingTimelineEntry>();
    (trackingData?.order?.timeline ?? []).forEach((entry) => {
      if (entry?.status) {
        map.set(entry.status, entry);
      }
    });
    return map;
  }, [trackingData?.order?.timeline]);

  const timelineStatuses = useMemo(() => new Set(timelineMap.keys()), [timelineMap]);

  const pickupCoordinate = useMemo(
    () => toLatLng(trackingData?.tracking?.pickupLocation?.coordinates) ?? FALLBACK_PICKUP,
    [trackingData?.tracking?.pickupLocation]
  );

  const dropoffCoordinate = useMemo(
    () => toLatLng(trackingData?.tracking?.deliveryLocation?.coordinates) ?? FALLBACK_DROPOFF,
    [trackingData?.tracking?.deliveryLocation]
  );

  const routeCoordinates = useMemo(
    () => buildRouteCoordinates(pickupCoordinate, dropoffCoordinate),
    [pickupCoordinate, dropoffCoordinate]
  );

  const mapRegion = useMemo(() => computeRegionFromRoute(routeCoordinates), [routeCoordinates]);

  const droneCoordinate = useMemo(() => {
    const coordinate = toLatLng(trackingData?.tracking?.droneLocation);
    if (coordinate) {
      return coordinate;
    }
    return normalizedStatus === 'delivered' ? dropoffCoordinate : pickupCoordinate;
  }, [trackingData?.tracking?.droneLocation, normalizedStatus, dropoffCoordinate, pickupCoordinate]);

  const flightProgress = trackingData?.tracking?.flightProgress ?? 0;

  const progressPolyline = useMemo(
    () => buildProgressPolyline(routeCoordinates, flightProgress),
    [routeCoordinates, flightProgress]
  );

  const routeHeading = useMemo(() => {
    const nextPoint = getCoordinateAtProgress(routeCoordinates, Math.min(flightProgress + 0.02, 1));
    return calculateBearing(droneCoordinate, nextPoint);
  }, [routeCoordinates, flightProgress, droneCoordinate]);

  useEffect(() => {
    if (!cameraReadyRef.current || !mapRef.current) {
      return;
    }

    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
  }, [routeCoordinates]);

  useEffect(() => {
    if (!cameraReadyRef.current || !mapRef.current) {
      return;
    }

    if (flightProgress <= 0) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        ...droneCoordinate,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      500
    );
  }, [droneCoordinate, flightProgress]);

  const etaInfo = useMemo(() => {
    const etaValue = trackingData?.tracking?.estimatedArrival ? new Date(trackingData.tracking.estimatedArrival) : null;
    if (!etaValue || Number.isNaN(etaValue.getTime())) {
      return null;
    }
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((etaValue.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return {
      text: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      rawSeconds: diffSeconds,
    };
  }, [trackingData?.tracking?.estimatedArrival]);

  const orderNumber = trackingData?.order?.orderNumber ?? trackingData?.order?.id ?? '---';
  const restaurantName = trackingData?.tracking?.pickupLocation?.name || 'Nhà hàng FoodFast';
  const restaurantAddress = trackingData?.tracking?.pickupLocation?.address;
  const deliveryAddress = trackingData?.tracking?.deliveryLocation?.address || 'Đang cập nhật địa chỉ giao hàng';
  const droneInfo = trackingData?.tracking?.drone;
  const droneCode = droneInfo?.droneId || droneInfo?.name || orderNumber.slice(0, 6).toUpperCase();
  const items = trackingData?.order?.items ?? [];
  const totalAmount = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const canConfirm = normalizedStatus === 'delivered';
  const timelineUpdatedAt = formatTimestamp(trackingData?.order?.updatedAt);

  const handleConfirm = () => {
    setAcknowledged(true);
    if (Platform.OS === 'web') {
      alert('Cảm ơn bạn! Đơn hàng đã được xác nhận.');
    } else {
      Alert.alert('Hoàn tất', 'Cảm ơn bạn! Đơn hàng đã được xác nhận.');
    }
  };

  const renderHeader = (title: string) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#EA5034" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 22 }} />
    </View>
  );

  if (!orderId) {
    return (
      <View style={styles.container}>
        {renderHeader('Theo dõi drone')}
        <View style={styles.centeredState}>
          <Ionicons name="alert-circle-outline" size={48} color="#EA5034" />
          <Text style={styles.centeredTitle}>Không tìm thấy thông tin đơn hàng</Text>
          <Text style={styles.centeredText}>Vui lòng quay lại danh sách đơn hàng và chọn đơn cần theo dõi.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !trackingData) {
    return (
      <View style={styles.container}>
        {renderHeader('Theo dõi drone')}
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#EA5034" />
          <Text style={styles.centeredTitle}>Đang tải dữ liệu theo dõi...</Text>
          <Text style={styles.centeredText}>Vui lòng chờ trong giây lát.</Text>
        </View>
      </View>
    );
  }

  const renderErrorBanner = () => {
    if (!error) {
      return null;
    }
    return (
      <View style={styles.errorBanner}>
        <Ionicons name="warning-outline" size={16} color="#B91C1C" />
        <Text style={styles.errorBannerText}>{error}</Text>
        <TouchableOpacity onPress={fetchTracking} style={styles.errorBannerRetry}>
          <Text style={styles.errorBannerRetryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader('Theo dõi drone')}

      {renderErrorBanner()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces>
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerLabel}>Trạng thái đơn</Text>
            <Text style={styles.bannerText}>
              Drone {droneCode}{' '}
              {normalizedStatus === 'delivering' ? 'đang bay tới điểm giao.' : 'đang sẵn sàng cho đơn hàng của bạn.'}
            </Text>
            {restaurantAddress ? (
              <Text style={styles.bannerSubText}>{restaurantAddress}</Text>
            ) : null}
          </View>
          <Ionicons name="radio-outline" size={20} color="#EA5034" />
        </View>

        <View style={styles.mapWrapper}>
          <MapView
            key={orderNumber}
            ref={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
            style={styles.map}
            initialRegion={mapRegion}
            showsCompass={true}
            showsPointsOfInterest={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            onMapReady={() => {
              cameraReadyRef.current = true;
              if (mapRef.current) {
                mapRef.current.fitToCoordinates(routeCoordinates, {
                  edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
                  animated: true,
                });
              }
            }}
          >
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="rgba(43, 76, 126, 0.18)"
              strokeWidth={8}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#1B2945"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
            {progressPolyline.length > 1 && (
              <Polyline
                coordinates={progressPolyline}
                strokeColor="#EA5034"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
              />
            )}

            <Marker
              coordinate={pickupCoordinate}
              title="Nhà hàng"
              description={restaurantName}
              tracksViewChanges={false}
              zIndex={100}
            >
              <View style={styles.markerWrapper}>
                <View style={[styles.markerHalo, styles.originHalo]} />
                <View style={[styles.markerIcon, styles.originMarker]}>
                  <Ionicons name="restaurant" size={20} color="#fff" />
                </View>
              </View>
            </Marker>

            <Marker
              coordinate={dropoffCoordinate}
              title="Điểm giao hàng"
              description={deliveryAddress}
              tracksViewChanges={false}
              zIndex={100}
            >
              <View style={styles.markerWrapper}>
                <View style={[styles.markerHalo, styles.destinationHalo]} />
                <View style={[styles.markerIcon, styles.destinationMarker]}>
                  <Ionicons name="home" size={20} color="#27AE60" />
                </View>
              </View>
            </Marker>

            <Marker
              coordinate={droneCoordinate}
              title={`Drone ${droneCode}`}
              description={`Tiến độ: ${Math.round(flightProgress * 100)}%`}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              rotation={routeHeading}
              flat
              zIndex={200}
            >
              <View style={styles.droneWrapper}>
                <View style={styles.droneGlow} />
                <View style={styles.droneMarker}>
                  <Ionicons name="airplane" size={22} color="#fff" />
                </View>
              </View>
            </Marker>
          </MapView>

          <View style={[styles.mapBadge, styles.shadow]}>
            <Ionicons name="navigate" size={16} color="#EA5034" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.mapBadgeLabel}>Điểm giao</Text>
              <Text style={styles.mapBadgeText} numberOfLines={1}>
                {deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.orderCode}>#{orderNumber}</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
              <Text style={styles.deliveryAddress}>{deliveryAddress}</Text>
              {timelineUpdatedAt ? (
                <Text style={styles.timelineUpdatedAt}>{`Cập nhật: ${timelineUpdatedAt}`}</Text>
              ) : null}
            </View>
            <View style={styles.etaPill}>
              <Ionicons name="time-outline" size={16} color="#EA5034" />
              <Text style={styles.etaText}>{etaInfo?.text ?? '--:--'}</Text>
            </View>
          </View>

          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const reached = timelineStatuses.has(step.key) || index <= statusIndex;
              const nextReached = index < statusIndex;
              const event = timelineMap.get(step.key);
              const timestamp = formatTimestamp(event?.timestamp);
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, reached && styles.timelineDotActive]}>
                      {reached ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <Ionicons name="ellipse" size={8} color="#CBD3E3" />
                      )}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View style={[styles.timelineConnector, nextReached && styles.timelineConnectorActive]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, reached && styles.timelineTitleActive]}>{String(step.label)}</Text>
                    <Text style={styles.timelineDescription}>{String(step.description)}</Text>
                    {timestamp ? <Text style={styles.timelineTimestamp}>{timestamp}</Text> : null}
                    {event?.note ? <Text style={styles.timelineNote}>{event.note}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.orderCard}>
            <Text style={styles.sectionHeading}>Chi tiết đơn hàng</Text>
            {items.length === 0 ? (
              <Text style={styles.emptyOrderText}>Đang cập nhật danh sách món.</Text>
            ) : (
              items.slice(0, 3).map((item, index) => (
                <View key={`${item.id || item.product || index}`} style={styles.orderRow}>
                  <Text style={styles.orderRowText}>{`${item.quantity}x ${item.name || 'Món ăn'}`}</Text>
                  <Text style={styles.orderRowPrice}>{`${((item.price ?? 0) * item.quantity).toLocaleString('vi-VN')}đ`}</Text>
                </View>
              ))
            )}
            {items.length > 3 && (
              <Text style={styles.moreItemsText}>{`và ${items.length - 3} món khác`}</Text>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{`${totalAmount.toLocaleString('vi-VN')}đ`}</Text>
            </View>
          </View>

          <View style={styles.handoverCard}>
            <View style={styles.handoverHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              <Text style={styles.sectionHeading}>Xác nhận nhận hàng</Text>
            </View>
            <Text style={styles.handoverText}>
              Khi drone hạ cánh, hãy kiểm tra khoang chứa. Nhấn "Tôi đã nhận hàng" để xác nhận với hệ thống.
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, (!canConfirm || acknowledged) && styles.confirmButtonDisabled]}
              disabled={!canConfirm || acknowledged}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{acknowledged ? 'Đã xác nhận' : 'Tôi đã nhận hàng'}</Text>
            </TouchableOpacity>
            {canConfirm ? (
              <Text style={styles.pinNote}>Mã xác nhận sẽ hiển thị từ nhân viên giao nhận.</Text>
            ) : (
              <Text style={styles.pinNote}>Mã xác nhận sẽ xuất hiện khi đơn được đánh dấu đã giao.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FD',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centeredTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1B2945',
  },
  centeredText: {
    marginTop: 8,
    fontSize: 14,
    color: '#7B85A1',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EA5034',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  errorBannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#7F1D1D',
  },
  errorBannerRetry: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  errorBannerRetryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyOrderText: {
    fontSize: 13,
    color: '#7B85A1',
    marginTop: 8,
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEDF5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  mapWrapper: {
    height: MAP_HEIGHT,
    backgroundColor: '#172B4D',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapWrapper: {
    height: MAP_HEIGHT,
    backgroundColor: '#172B4D',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F1',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  bannerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA5034',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#5D6379',
  },
  bannerSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  mapBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  mapBadgeLabel: {
    fontSize: 12,
    color: '#7A819C',
    fontWeight: '600',
  },
  mapBadgeText: {
    fontSize: 13,
    color: '#1B2945',
    marginTop: 2,
  },
  demoChip: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF5F1',
  },
  demoChipText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#EA5034',
  },
  markerWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHalo: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEAE6',
  },
  originHalo: {
    backgroundColor: '#FFEAE6',
  },
  destinationHalo: {
    backgroundColor: '#E8F8EF',
  },
  markerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  originMarker: {
    backgroundColor: '#EA5034',
  },
  destinationMarker: {
    backgroundColor: '#27AE60',
  },
  droneWrapper: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  droneGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF5F1',
  },
  droneMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EA5034',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA5034',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomSheet: {
    display: 'none',
  },
  bottomContent: {
    display: 'none',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderCode: {
    fontSize: 14,
    color: '#7B85A1',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B2945',
    marginTop: 4,
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#7B85A1',
    marginTop: 4,
  },
  timelineUpdatedAt: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF1EC',
  },
  etaText: {
    color: '#EA5034',
    fontWeight: '600',
    fontSize: 14,
  },
  timeline: {
    backgroundColor: '#F9FAFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineRail: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CBD3E3',
    backgroundColor: '#fff',
  },
  timelineDotActive: {
    backgroundColor: '#EA5034',
    borderColor: '#EA5034',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E4E9F3',
    marginVertical: 6,
  },
  timelineConnectorActive: {
    backgroundColor: '#EA5034',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEFF7',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#51607A',
  },
  timelineTitleActive: {
    color: '#EA5034',
  },
  timelineDescription: {
    fontSize: 13,
    color: '#7B85A1',
    marginTop: 4,
  },
  timelineTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  timelineNote: {
    marginTop: 4,
    fontSize: 12,
    color: '#4B5563',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2945',
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderRowText: {
    fontSize: 14,
    color: '#51607A',
  },
  orderRowPrice: {
    fontSize: 14,
    color: '#1B2945',
    fontWeight: '600',
  },
  moreItemsText: {
    fontSize: 13,
    color: '#7B85A1',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEFF7',
  },
  totalLabel: {
    fontSize: 15,
    color: '#51607A',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#EA5034',
    fontWeight: '700',
  },
  handoverCard: {
    backgroundColor: '#F7FFF9',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C8F3D5',
  },
  handoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  handoverText: {
    fontSize: 14,
    color: '#4C5A54',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#A5D6B1',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  pinNote: {
    fontSize: 13,
    color: '#4C5A54',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default OrderTrackingScreen;
