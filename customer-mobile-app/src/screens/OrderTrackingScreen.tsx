import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width, height } = Dimensions.get('window');

const OrderTrackingScreen = ({ navigation }: any) => {
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const [dronePosition] = useState(new Animated.ValueXY({ x: 50, y: 50 }));
  const [orderStatus, setOrderStatus] = useState<'preparing' | 'delivering' | 'delivered'>('preparing');
  const [estimatedTime, setEstimatedTime] = useState(15);

  useEffect(() => {
    // Simulate order status changes
    const statusTimer = setTimeout(() => {
      setOrderStatus('delivering');
      startDroneAnimation();
    }, 3000);

    const deliveryTimer = setTimeout(() => {
      setOrderStatus('delivered');
    }, 18000);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(deliveryTimer);
    };
  }, []);

  useEffect(() => {
    // Update estimated time every second
    const timer = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startDroneAnimation = () => {
    // Animate drone from restaurant to customer (simulated path)
    Animated.sequence([
      Animated.timing(dronePosition, {
        toValue: { x: 150, y: 100 },
        duration: 5000,
        useNativeDriver: false,
      }),
      Animated.timing(dronePosition, {
        toValue: { x: 250, y: 150 },
        duration: 5000,
        useNativeDriver: false,
      }),
      Animated.timing(dronePosition, {
        toValue: { x: 250, y: 300 },
        duration: 5000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubText}>Hãy đặt món ngay để trải nghiệm!</Text>
        </View>
      </View>
    );
  }

  const getStatusStep = (status: string) => {
    const steps = {
      confirmed: 0,
      preparing: 1,
      delivering: 2,
      delivered: 3,
    };
    return steps[status as keyof typeof steps] || 0;
  };

  const currentStep = getStatusStep(currentOrder.status);

  const statusSteps = [
    { key: 'confirmed', label: 'Đã xác nhận', icon: '✓' },
    { key: 'preparing', label: 'Đang chuẩn bị', icon: '👨‍🍳' },
    { key: 'delivering', label: 'Đang giao', icon: '🚁' },
    { key: 'delivered', label: 'Đã giao', icon: '🎉' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mock Map */}
      <View style={styles.mapContainer}>
        <View style={styles.mockMap}>
          {/* Restaurant marker */}
          <View style={[styles.marker, { top: 50, left: 50 }]}>
            <Text style={styles.markerIcon}>🏪</Text>
            <Text style={styles.markerLabel}>Nhà hàng</Text>
          </View>

          {/* Customer marker */}
          <View style={[styles.marker, { top: 250, left: 300 }]}>
            <Text style={styles.markerIcon}>📍</Text>
            <Text style={styles.markerLabel}>Bạn</Text>
          </View>

          {/* Drone animation */}
          {orderStatus === 'delivering' && (
            <Animated.View
              style={[
                styles.droneMarker,
                {
                  transform: [
                    { translateX: dronePosition.x },
                    { translateY: dronePosition.y },
                  ],
                },
              ]}
            >
              <Text style={styles.droneIcon}>🚁</Text>
            </Animated.View>
          )}

          {/* Path line */}
          <View style={styles.pathLine} />
        </View>
      </View>

      <ScrollView style={styles.bottomSheet}>
        {/* Order Info */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>#{currentOrder.id.slice(0, 8)}</Text>
              <Text style={styles.restaurantName}>{currentOrder.restaurantName}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {orderStatus === 'preparing' ? '👨‍🍳 Đang chuẩn bị' : orderStatus === 'delivering' ? '🚁 Đang giao' : '✓ Đã giao'}
              </Text>
            </View>
          </View>
        </View>

        {/* Estimated Time */}
        {orderStatus !== 'delivered' && (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateLabel}>Thời gian dự kiến</Text>
            <Text style={styles.estimateTime}>
              {`${Math.floor(estimatedTime / 60)}:${(estimatedTime % 60).toString().padStart(2, '0')}`}
            </Text>
            <Text style={styles.estimateSubtext}>
              Drone sẽ giao đến trong vài phút
            </Text>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          {currentOrder.items.map((item: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {`${item.quantity}x ${item.name}`}
              </Text>
              <Text style={styles.itemPrice}>
                {`${(item.price * item.quantity).toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{`${currentOrder.total.toLocaleString('vi-VN')}đ`}</Text>
          </View>
        </View>

        {/* Delivery Success */}
        {orderStatus === 'delivered' && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Giao hàng thành công!</Text>
            <Text style={styles.successText}>
              Cảm ơn bạn đã sử dụng dịch vụ giao hàng drone của FoodFast
            </Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.homeButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#EA5034',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: '#E8F5E9',
  },
  mockMap: {
    flex: 1,
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerIcon: {
    fontSize: 32,
  },
  markerLabel: {
    fontSize: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  droneMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  droneIcon: {
    fontSize: 40,
  },
  pathLine: {
    position: 'absolute',
    top: 65,
    left: 65,
    width: 250,
    height: 200,
    borderWidth: 2,
    borderColor: '#EA5034',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  orderCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#FFF5F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#EA5034',
    fontWeight: '600',
  },
  estimateCard: {
    backgroundColor: '#EA5034',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  estimateLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  estimateTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  estimateSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  timeline: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  timelineIconActive: {
    backgroundColor: '#EA5034',
    borderColor: '#EA5034',
  },
  timelineIconText: {
    fontSize: 20,
  },
  timelineIconTextActive: {
    fontSize: 20,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: '#EA5034',
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timelineLabelActive: {
    color: '#333',
  },
  timelineStatus: {
    fontSize: 14,
    color: '#EA5034',
    marginTop: 4,
  },
  itemsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA5034',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: '#27AE60',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
  },
  homeButton: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderTrackingScreen;
