import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const OrderTrackingScreen = ({ navigation }: any) => {
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const [dronePosition] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate drone
    Animated.loop(
      Animated.sequence([
        Animated.timing(dronePosition, {
          toValue: 20,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dronePosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info */}
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Mã đơn hàng: {currentOrder.id}</Text>
          <Text style={styles.restaurantName}>{currentOrder.restaurantName}</Text>
          <Text style={styles.orderTotal}>
            Tổng tiền: {currentOrder.total.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {/* Drone Animation */}
        {currentOrder.status === 'delivering' && (
          <View style={styles.droneContainer}>
            <Animated.Text
              style={[
                styles.droneIcon,
                { transform: [{ translateY: dronePosition }] },
              ]}
            >
              🚁
            </Animated.Text>
            <Text style={styles.droneText}>Drone đang bay đến</Text>
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.timeline}>
          {statusSteps.map((step, index) => (
            <View key={step.key} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    index <= currentStep && styles.timelineIconActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.timelineIconText,
                      index <= currentStep && styles.timelineIconTextActive,
                    ]}
                  >
                    {step.icon}
                  </Text>
                </View>
                {index < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      index < currentStep && styles.timelineLineActive,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    index <= currentStep && styles.timelineLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {index === currentStep && (
                  <Text style={styles.timelineStatus}>Đang thực hiện</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          {currentOrder.items.map((item: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {item.price.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
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
    fontSize: 16,
    color: '#EA5034',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: 'bold',
  },
  droneContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  droneIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  droneText: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: '600',
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderTrackingScreen;
