import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { notificationAPI } from '../services/api';

interface Notification {
  _id: string;
  recipient: string;
  recipientRole: string;
  type: string;
  title: string;
  message: string;
  relatedOrder?: {
    _id: string;
    orderNumber: string;
    status: string;
  };
  isRead: boolean;
  createdAt: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      if (response?.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return '🚁';
      case 'promo': return '🎁';
      case 'system': return '📱';
      default: return '📬';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

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
        <TouchableOpacity onPress={async () => {
          try {
            await notificationAPI.markAllAsRead();
            fetchNotifications();
          } catch (error) {
            console.error('Mark all as read error:', error);
          }
        }}>
          <Text style={styles.markAllRead}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA5034" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA5034']} />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>Chưa có thông báo</Text>
            </View>
          ) : (
            <>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification._id}
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.unreadCard,
                  ]}
                >
                  <View style={[styles.iconContainer, getNotificationStyle(notification.type)]}>
                    <Text style={styles.icon}>{getIcon(notification.type)}</Text>
                  </View>
                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{notification.title}</Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
