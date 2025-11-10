import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { restoreSavedCart, deleteSavedCart } from '../store/slices/cartSlice';
import { Ionicons } from '@expo/vector-icons';
import { submitOrderReview, Order as OrderType } from '../store/slices/orderSlice';

const OrdersScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'active' | 'reviews' | 'history' | 'saved'>('active');
  const orders = useSelector((state: RootState) => state.orders.orders);
  const savedCarts = useSelector((state: RootState) => state.cart.savedCarts);
  const dispatch = useDispatch();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const activeOrders = useMemo(
    () => orders.filter(order => order.status !== 'delivered'),
    [orders]
  );

  const reviewOrders = useMemo(
    () => orders.filter(order => order.status === 'delivered' && !order.isReviewed),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter(order => order.status === 'delivered'),
    [orders]
  );

  const handleRestoreCart = (index: number) => {
    Alert.alert(
      'Khôi phục đơn tạm',
      'Giỏ hàng hiện tại sẽ được lưu vào đơn tạm. Bạn có muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: () => {
            dispatch(restoreSavedCart(index));
            Alert.alert('Thành công', 'Đã khôi phục đơn tạm vào giỏ hàng!');
            navigation.navigate('Cart');
          },
        },
      ]
    );
  };

  const handleDeleteSavedCart = (index: number) => {
    Alert.alert(
      'Xóa đơn tạm',
      'Bạn có chắc muốn xóa đơn tạm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteSavedCart(index));
          },
        },
      ]
    );
  };

  const getStatusInfo = (status: OrderType['status'] | string) => {
    switch (status) {
      case 'delivered':
        return { label: '✓ Đã giao', style: styles.statusDelivered };
      case 'delivering':
      case 'shipping':
        return { label: '🚁 Đang giao', style: styles.statusDelivering };
      case 'preparing':
        return { label: '👨‍🍳 Đang chuẩn bị', style: styles.statusPreparing };
      case 'confirmed':
      default:
        return { label: '⏳ Chờ xác nhận', style: styles.statusConfirmed };
    }
  };

  const renderStarRow = (rating: number, size = 14, onSelect?: (value: number) => void) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(value => {
        const iconName = rating >= value ? 'star' : rating >= value - 0.5 ? 'star-half' : 'star-outline';
        if (!onSelect) {
          return (
            <Ionicons
              key={value}
              name={iconName as any}
              size={size}
              color="#FFB800"
              style={styles.starIcon}
            />
          );
        }
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName as any}
              size={size}
              color="#FFB800"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const openReviewModal = (order: OrderType) => {
    setSelectedOrder(order);
    setReviewRating(order.rating ?? 0);
    setReviewComment(order.reviewComment ?? '');
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedOrder(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = () => {
    if (!selectedOrder) {
      return;
    }
    if (reviewRating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá.');
      return;
    }
    dispatch(submitOrderReview({
      id: selectedOrder.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
    }));
    Alert.alert('Cảm ơn bạn!', 'Đánh giá đã được ghi nhận.');
    closeReviewModal();
  };

  const renderItemsPreview = (order: OrderType) => (
    <View style={styles.orderItems}>
      {order.items.slice(0, 2).map((orderItem, idx) => (
        <Text key={orderItem.id ?? `${order.id}-${idx}`} style={styles.itemText}>
          {orderItem.quantity}x {orderItem.name}
        </Text>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>và {order.items.length - 2} món khác</Text>
      )}
    </View>
  );

  const renderActiveOrder = ({ item }: { item: OrderType }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          <View style={[styles.statusBadge, statusInfo.style]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        {renderItemsPreview(item)}
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.orderTotal}>{item.total.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.orderActions}>
          <Ionicons name="navigate-outline" size={16} color="#EA5034" style={styles.orderActionIcon} />
          <Text style={styles.orderActionText}>Theo dõi hành trình</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderReviewOrder = ({ item }: { item: OrderType }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <View style={[styles.statusBadge, styles.statusDelivered]}>
          <Text style={styles.statusText}>✓ Đã giao</Text>
        </View>
      </View>
      {renderItemsPreview(item)}
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          Giao ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.orderTotal}>{item.total.toLocaleString('vi-VN')}đ</Text>
      </View>
      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => openReviewModal(item)}
        activeOpacity={0.85}
      >
        <Text style={styles.reviewButtonText}>Đánh giá ngay</Text>
        <Ionicons name="star" size={16} color="#fff" style={styles.reviewButtonIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderHistoryOrder = ({ item }: { item: OrderType }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <View style={[styles.statusBadge, styles.statusDelivered]}>
          <Text style={styles.statusText}>✓ Đã giao</Text>
        </View>
      </View>
      {renderItemsPreview(item)}
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.orderTotal}>{item.total.toLocaleString('vi-VN')}đ</Text>
      </View>
      <View style={styles.historyReviewRow}>
        {item.isReviewed ? (
          <View style={styles.historyRatingGroup}>
            {renderStarRow(item.rating ?? 0)}
            <Text style={styles.historyRatingText}>{(item.rating ?? 0).toFixed(1)}/5</Text>
          </View>
        ) : (
          <Text style={styles.pendingReviewText}>Chưa có đánh giá</Text>
        )}
        <TouchableOpacity
          style={styles.reviewButtonGhost}
          onPress={() => openReviewModal(item)}
        >
          <Text style={styles.reviewButtonGhostText}>
            {item.isReviewed ? 'Chỉnh sửa đánh giá' : 'Đánh giá'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = (
    icon: string,
    title: string,
    description: string,
    action?: { label: string; onPress: () => void }
  ) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
      {action && (
        <TouchableOpacity style={styles.exploreButton} onPress={action.onPress}>
          <Text style={styles.exploreButtonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'active':
        if (activeOrders.length === 0) {
          return renderEmptyState(
            '📦',
            'Chưa có đơn đang xử lý',
            'Khi đặt món, đơn sẽ hiển thị tại đây.',
            { label: 'Khám phá món ngon', onPress: () => navigation.navigate('Home') }
          );
        }
        return (
          <FlatList
            data={activeOrders}
            renderItem={renderActiveOrder}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'reviews':
        if (reviewOrders.length === 0) {
          return renderEmptyState(
            '⭐',
            'Chưa có đơn cần đánh giá',
            'Đánh giá sẽ giúp món ngon lên top nhanh hơn!'
          );
        }
        return (
          <FlatList
            data={reviewOrders}
            renderItem={renderReviewOrder}
            keyExtractor={item => `${item.id}-review`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'history':
        if (historyOrders.length === 0) {
          return renderEmptyState(
            '🕑',
            'Chưa có lịch sử đơn hàng',
            'Đơn hàng đã giao sẽ được lưu lại giúp bạn đặt lại nhanh.'
          );
        }
        return (
          <FlatList
            data={historyOrders}
            renderItem={renderHistoryOrder}
            keyExtractor={item => `${item.id}-history`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'saved':
      default:
        if (savedCarts.length === 0) {
          return renderEmptyState(
            '📋',
            'Chưa có đơn tạm',
            'Đơn tạm sẽ tạo khi bạn thêm món từ nhà hàng khác vào giỏ.'
          );
        }
        return (
          <FlatList
            data={savedCarts}
            renderItem={renderSavedCart}
            keyExtractor={(_item, index) => `saved-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
    }
  };

  const renderSavedCart = ({ item, index }: any) => (
    <View style={styles.savedCartCard}>
      <View style={styles.savedCartHeader}>
        <View>
          <Text style={styles.savedRestaurantName}>{item.restaurantName}</Text>
          <Text style={styles.savedDate}>
            Lưu lúc {new Date(item.savedAt).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.savedCartBadge}>
          <Text style={styles.savedCartBadgeText}>{item.items.length} món</Text>
        </View>
      </View>
      
      <View style={styles.savedCartItems}>
        {item.items.slice(0, 3).map((cartItem: any, idx: number) => (
          <Text key={idx} style={styles.savedItemText}>
            {cartItem.quantity}x {cartItem.name}
          </Text>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>và {item.items.length - 3} món khác</Text>
        )}
      </View>

      <View style={styles.savedCartFooter}>
        <Text style={styles.savedCartTotal}>{item.total.toLocaleString('vi-VN')}đ</Text>
        <View style={styles.savedCartActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSavedCart(index)}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => handleRestoreCart(index)}
          >
            <Text style={styles.restoreButtonText}>Khôi phục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Đang xử lý
          </Text>
          {activeOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            Đánh giá
          </Text>
          {reviewOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{reviewOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử
          </Text>
          {historyOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{historyOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Đơn tạm
          </Text>
          {savedCarts.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{savedCarts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderTabContent()}

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đánh giá món ăn</Text>
            <Text style={styles.modalSubtitle}>
              {selectedOrder?.restaurantName ?? ''}
            </Text>
            {renderStarRow(reviewRating, 24, value => setReviewRating(value))}
            <TextInput
              style={styles.modalInput}
              placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeReviewModal}
              >
                <Text style={styles.modalButtonSecondaryText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.modalButtonPrimaryText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: '#EA5034',
  },
  tabText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#EA5034',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#EA5034',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusDelivered: {
    backgroundColor: '#E8F5E9',
  },
  statusDelivering: {
    backgroundColor: '#E3F2FD',
  },
  statusConfirmed: {
    backgroundColor: '#EDE7F6',
  },
  statusShipping: {
    backgroundColor: '#E3F2FD',
  },
  statusPreparing: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  orderItems: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 13,
    color: '#999',
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#EA5034',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  orderActionIcon: {
    marginRight: 6,
  },
  orderActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA5034',
  },
  savedCartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  savedCartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  savedRestaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
  },
  savedCartBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  savedCartBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  savedCartItems: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  savedItemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  savedCartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  savedCartTotal: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  savedCartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  restoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EA5034',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  reviewButton: {
    marginTop: 12,
    backgroundColor: '#EA5034',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  reviewButtonIcon: {
    marginTop: -2,
  },
  historyReviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  historyRatingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyRatingText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    fontWeight: '600',
  },
  pendingReviewText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  reviewButtonGhost: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA5034',
  },
  reviewButtonGhostText: {
    color: '#EA5034',
    fontSize: 13,
    fontWeight: '600',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#EA5034',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    marginTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  modalButtonPrimary: {
    backgroundColor: '#EA5034',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});

export default OrdersScreen;
