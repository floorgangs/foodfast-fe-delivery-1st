import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Trên web dùng confirm
      if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        dispatch(logout());
      }
    } else {
      // Trên mobile dùng Alert
      const Alert = require('react-native').Alert;
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: () => {
              dispatch(logout());
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 70 }} />
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={40} color="#EA5034" />
          </View>
          {!isAuthenticated ? (
            <>
              <Text style={styles.userName}>Chào mừng bạn!</Text>
              <Text style={styles.guestText}>Đăng nhập để trải nghiệm tốt hơn</Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.userPhone}>{user?.phone || '0123456789'}</Text>
            </>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PersonalInfo')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={22} color="#EA5034" />
            </View>
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Address')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="location-outline" size={22} color="#EA5034" />
            </View>
            <Text style={styles.menuText}>Địa chỉ giao hàng</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentMethod')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="card-outline" size={22} color="#EA5034" />
            </View>
            <Text style={styles.menuText}>Phương thức thanh toán</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Vouchers')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="gift-outline" size={22} color="#EA5034" />
            </View>
            <Text style={styles.menuText}>Ưu đãi của tôi</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Order History */}
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Đơn hàng của tôi</Text>
          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Ionicons name="cube-outline" size={56} color="#d1d5db" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          ) : (
            orders.slice(0, 5).map((order: any) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderTracking')}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id}</Text>
                  <Text style={[styles.orderStatus, getStatusStyle(order.status)]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
                <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                <Text style={styles.orderTotal}>
                  {order.total.toLocaleString('vi-VN')}đ
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    delivering: 'Đang giao',
    delivered: 'Đã giao',
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status: string) => {
  if (status === 'delivered') return { color: '#10B981' };
  if (status === 'delivering') return { color: '#EA5034' };
  return { color: '#F59E0B' };
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
    fontSize: 16,
    color: '#EA5034',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  guestText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  orderSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: 'bold',
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA5034',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EA5034',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
