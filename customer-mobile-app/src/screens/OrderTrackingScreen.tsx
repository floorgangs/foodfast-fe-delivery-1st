import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, LatLng, Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;
const INITIAL_CAMERA_ZOOM = 15.8;
const CAMERA_PITCH = 45;
const CAMERA_ANIMATION_DURATION = 750;
const ETA_SECONDS = 15 * 60;

const statusSteps = [
  { key: 'confirmed', label: 'Đã xác nhận', description: 'FoodFast đã nhận đơn của bạn', threshold: 0 },
  { key: 'preparing', label: 'Đang chuẩn bị', description: 'Nhà hàng đang hoàn tất món ăn', threshold: 0.2 },
  { key: 'inflight', label: 'Drone đang bay', description: 'Drone rời bãi đáp và bay đường thẳng', threshold: 0.45 },
  { key: 'arriving', label: 'Sắp giao', description: 'Drone hạ độ cao để giao hàng', threshold: 0.75 },
  { key: 'delivered', label: 'Đã giao', description: 'Phi công xác nhận bạn đã nhận hàng', threshold: 0.98 },
] as const;

const getFlightProgress = (progress: number): number => {
  const inflightStep = statusSteps.find(step => step.key === 'inflight');
  const inflightThreshold = inflightStep?.threshold ?? 0.45;

  if (progress <= inflightThreshold) {
    return 0;
  }

  const normalized = (progress - inflightThreshold) / (1 - inflightThreshold);
  return Math.min(Math.max(normalized, 0), 1);
};

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

const OrderTrackingScreen = ({ navigation }: any) => {
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const progressRef = useRef(new Animated.Value(0));
  const mapRef = useRef<MapView | null>(null);
  const cameraReadyRef = useRef(false);
  const lastHeadingRef = useRef(0);
  const [progressValue, setProgressValue] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const fallbackOrder = useMemo(
    () => ({
      id: 'FFDEMO1',
      restaurantName: 'FoodFast Demo Kitchen',
      items: [
        { id: 'demo-1', name: 'Foodie Rice Bowl', quantity: 1, price: 78000 },
        { id: 'demo-2', name: 'Coconut Smoothie', quantity: 2, price: 45000 },
        { id: 'demo-3', name: 'Veggie Spring Rolls', quantity: 1, price: 32000 },
      ],
      total: 200000,
      status: 'delivering' as const,
      createdAt: new Date().toISOString(),
      deliveryAddress: '21 Nguyễn Trung Trực, Quận 1, TP.HCM',
      pickupCoordinate: FALLBACK_PICKUP,
      dropoffCoordinate: FALLBACK_DROPOFF,
      unlockPin: '4821',
    }),
    [],
  );
  const activeOrder = currentOrder ?? fallbackOrder;
  const isMockOrder = !currentOrder;

  useEffect(() => {
    const listener = progressRef.current.addListener(({ value }) => setProgressValue(value));
    return () => progressRef.current.removeListener(listener);
  }, []);

  useEffect(() => {
    const progress = progressRef.current;

    progress.stopAnimation();
    progress.setValue(0);
    setProgressValue(0);
    setAcknowledged(false);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 22000,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        progress.setValue(1);
        setProgressValue(1);
      }
    });

    return () => {
      animation.stop();
    };
  }, [currentOrder?.id]);

  const activeStepIndex = useMemo(
    () => statusSteps.reduce((acc, step, index) => (progressValue >= step.threshold ? index : acc), 0),
    [progressValue],
  );

  const etaSeconds = Math.max(0, Math.round((1 - progressValue) * ETA_SECONDS));
  const etaMinutes = Math.floor(etaSeconds / 60);
  const etaRemainingSeconds = etaSeconds % 60;
  const droneCode = `FF-${activeOrder.id.slice(0, 4).toUpperCase()}`;
  const canConfirm = progressValue >= statusSteps[statusSteps.length - 1].threshold;
  const pickupCoordinate = activeOrder.pickupCoordinate ?? FALLBACK_PICKUP;
  const dropoffCoordinate = activeOrder.dropoffCoordinate ?? FALLBACK_DROPOFF;
  const routeCoordinates = useMemo(
    () => buildRouteCoordinates(pickupCoordinate, dropoffCoordinate),
    [pickupCoordinate, dropoffCoordinate],
  );
  const mapRegion = useMemo(() => computeRegionFromRoute(routeCoordinates), [routeCoordinates]);
  const flightProgress = useMemo(() => getFlightProgress(progressValue), [progressValue]);
  const droneCoordinate = useMemo(
    () => getCoordinateAtProgress(routeCoordinates, flightProgress),
    [routeCoordinates, flightProgress],
  );
  const routeHeading = useMemo(() => {
    const nextPoint = getCoordinateAtProgress(routeCoordinates, Math.min(flightProgress + 0.02, 1));
    return calculateBearing(droneCoordinate, nextPoint);
  }, [routeCoordinates, flightProgress, droneCoordinate]);
  const progressPolyline = useMemo(
    () => buildProgressPolyline(routeCoordinates, flightProgress),
    [routeCoordinates, flightProgress],
  );

  useEffect(() => {
    cameraReadyRef.current = false;
  }, [activeOrder.id]);

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
      500,
    );
  }, [droneCoordinate, flightProgress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#EA5034" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi drone</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerLabel}>Drone tự động</Text>
          <Text style={styles.bannerText}>Drone {droneCode} đang bay thẳng từ nhà hàng đến vị trí giao hàng.</Text>
        </View>
        <Ionicons name="radio-outline" size={20} color="#EA5034" />
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          key={activeOrder.id}
          ref={mapInstance => {
            mapRef.current = mapInstance;
          }}
          style={styles.map}
          initialRegion={mapRegion}
          showsCompass={false}
          showsPointsOfInterest={false}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
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
            description={activeOrder.restaurantName}
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
            description={activeOrder.deliveryAddress}
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
            description={`Đang bay: ${Math.round(progressValue * 100)}%`}
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
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.mapBadgeLabel}>Điểm giao</Text>
            <Text style={styles.mapBadgeText}>Cửa nhà • Khu vực an toàn</Text>
          </View>
        </View>
        {isMockOrder && (
          <View style={styles.demoChip}>
            <Ionicons name="sparkles-outline" size={14} color="#EA5034" />
            <Text style={styles.demoChipText}>Dữ liệu demo</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <ScrollView
          contentContainerStyle={styles.bottomContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.orderCode}>#{activeOrder.id.slice(0, 6)}</Text>
              <Text style={styles.restaurantName}>{activeOrder.restaurantName}</Text>
              <Text style={styles.deliveryAddress}>{activeOrder.deliveryAddress}</Text>
            </View>
            <View style={styles.etaPill}>
              <Ionicons name="time-outline" size={16} color="#EA5034" />
              <Text style={styles.etaText}>
                {etaMinutes.toString().padStart(2, '0')}:{etaRemainingSeconds.toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          <View style={styles.timeline}>
            {statusSteps.map((step, index) => {
              const reached = index <= activeStepIndex;
              const nextReached = index < activeStepIndex;
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
                    {index < statusSteps.length - 1 && (
                      <View style={[styles.timelineConnector, nextReached && styles.timelineConnectorActive]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, reached && styles.timelineTitleActive]}>{String(step.label)}</Text>
                    <Text style={styles.timelineDescription}>{String(step.description)}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.orderCard}>
            <Text style={styles.sectionHeading}>Chi tiết đơn hàng</Text>
            {activeOrder.items.slice(0, 3).map((item: any, index: number) => (
              <View key={`${item.id}-${index}`} style={styles.orderRow}>
                <Text style={styles.orderRowText}>
                  {`${item.quantity}x ${item.name}`}
                </Text>
                <Text style={styles.orderRowPrice}>
                  {`${(item.price * item.quantity).toLocaleString('vi-VN')}đ`}
                </Text>
              </View>
            ))}
            {activeOrder.items.length > 3 && (
              <Text style={styles.moreItemsText}>{`và ${activeOrder.items.length - 3} món khác`}</Text>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{`${activeOrder.total.toLocaleString('vi-VN')}đ`}</Text>
            </View>
          </View>

          <View style={styles.handoverCard}>
            <View style={styles.handoverHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              <Text style={styles.sectionHeading}>Xác nhận nhận hàng</Text>
            </View>
            <Text style={styles.handoverText}>
              Khi drone hạ cánh, hãy kiểm tra mã PIN trên khoang chứa. Nhấn "Tôi đã nhận hàng" để mở khoang và hoàn tất đơn.
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, (!canConfirm || acknowledged) && styles.confirmButtonDisabled]}
              disabled={!canConfirm || acknowledged}
              onPress={() => {
                setAcknowledged(true);
                if (Platform.OS === 'web') {
                  alert('Cảm ơn bạn! Đơn hàng đã được xác nhận.');
                } else {
                  Alert.alert('Hoàn tất', 'Cảm ơn bạn! Đơn hàng đã được xác nhận.');
                }
              }}
            >
              <Text style={styles.confirmButtonText}>
                {acknowledged ? 'Đã xác nhận' : 'Tôi đã nhận hàng'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.pinNote}>{`Mã PIN: ${activeOrder.unlockPin ?? '****'}`}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FD',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
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
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomContent: {
    paddingBottom: 36,
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
