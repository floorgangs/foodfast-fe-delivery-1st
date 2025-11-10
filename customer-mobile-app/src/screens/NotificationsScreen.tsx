import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Đơn hàng đang giao',
    message: 'Drone đang trên đường giao hàng đến bạn. Dự kiến 10 phút nữa.',
    time: '5 phút trước',
    isRead: false,
    icon: '🚁',
  },
  {
    id: '2',
    type: 'promo',
    title: 'Giảm 50K cho đơn đầu tiên',
    message: 'Mã giảm giá WELCOME50 đã được thêm vào tài khoản của bạn.',
    time: '1 giờ trước',
    isRead: false,
    icon: '🎁',
  },
  {
    id: '3',
    type: 'order',
    title: 'Giao hàng thành công',
    message: 'Đơn hàng #12345 đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ!',
    time: '2 giờ trước',
    isRead: true,
    icon: '✅',
  },
  {
    id: '4',
    type: 'promo',
    title: 'Flash Sale - Giảm 30%',
    message: 'Flash Sale đang diễn ra! Giảm giá 30% cho tất cả món ăn từ 10:00 - 14:00.',
    time: '3 giờ trước',
    isRead: true,
    icon: '🔥',
  },
  {
    id: '5',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'FoodFast đã cập nhật tính năng mới: Theo dõi drone realtime.',
    time: '1 ngày trước',
    isRead: true,
    icon: '📱',
  },
  {
    id: '6',
    type: 'order',
    title: 'Nhà hàng đã xác nhận',
    message: 'Đơn hàng của bạn đã được nhà hàng xác nhận và đang chuẩn bị.',
    time: '1 ngày trước',
    isRead: true,
    icon: '👨‍🍳',
  },
  {
    id: '7',
    type: 'promo',
    title: 'Tích điểm đổi quà',
    message: 'Bạn đã tích đủ 100 điểm! Đổi ngay quà tặng hấp dẫn.',
    time: '2 ngày trước',
    isRead: true,
    icon: '💝',
  },
];

const NotificationsScreen = () => {
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'order':
        return { backgroundColor: '#E6F3FF' };
      case 'promo':
        return { backgroundColor: '#FFF0E6' };
      case 'system':
        return { backgroundColor: '#F0F0F0' };
      default:
        return { backgroundColor: '#F5F5F5' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard,
            ]}
          >
            <View style={[styles.iconContainer, getNotificationStyle(notification.type)]}>
              <Text style={styles.icon}>{notification.icon}</Text>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{notification.title}</Text>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty space at bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  markAllRead: {
    fontSize: 14,
    color: '#EA5034',
    fontWeight: '500',
  },
  notificationCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  unreadCard: {
    backgroundColor: '#FFFAF8',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA5034',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationsScreen;
