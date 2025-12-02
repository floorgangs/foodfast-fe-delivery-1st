import React, { useCallback, useMemo, useRef, useState } from "react";
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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { Ionicons } from "@expo/vector-icons";
import {
  submitOrderReview,
  Order as OrderType,
  setOrders,
} from "../store/slices/orderSlice";
import { orderAPI, reviewAPI } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useResponsive from "../hooks/useResponsive";

const OrdersScreen = ({ navigation }: any) => {
  const { isLandscape, numColumns, containerPadding, cardWidth } =
    useResponsive();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    // Kiểm tra token trước khi fetch
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      return; // Không fetch nếu chưa đăng nhập
    }

    const normalizeStatus = (status: string) => {
      // Normalize status but preserve delivered/completed
      if (!status) return "pending";
      const normalized = status.toLowerCase().trim();

      // Map completed to delivered for consistency
      if (normalized === "completed") return "delivered";
      if (normalized === "delivered") return "delivered";
      if (normalized === "preparing") return "confirmed";

      return normalized;
    };

    const formatDeliveryAddress = (address: any) => {
      if (!address) return "";
      if (typeof address === "string") return address;
      const parts = [
        address.street || address.address,
        address.ward,
        address.district,
        address.city,
      ].filter(Boolean);
      return parts.join(", ");
    };

    const toNumber = (value: any) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };

    const normalizeCoordinate = (coordinate: any) => {
      if (!coordinate) return undefined;
      const latitude = toNumber(coordinate.latitude ?? coordinate.lat);
      const longitude = toNumber(coordinate.longitude ?? coordinate.lng);
      if (latitude == null || longitude == null) {
        return undefined;
      }
      return { latitude, longitude };
    };

    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setOrdersLoading(true);
      const response = await orderAPI.getMyOrders();
      const payload = response?.data ?? response;
      const orderList = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const transformedOrders = orderList.map((order: any) => {
        const items = (order.items || []).map((item: any) => {
          const product =
            item.product && typeof item.product === "object"
              ? item.product
              : null;
          const productId =
            product?._id || product?.id || item.product || item._id;
          return {
            id: productId,
            name: product?.name || item.name || "Sản phẩm",
            quantity: item.quantity,
            price: item.price,
          };
        });
        const customerReview = order.customerReview || order.review;
        // Chỉ coi là đã review nếu có rating
        const hasReviewed =
          order.isReviewed === true ||
          (customerReview && customerReview.rating > 0);
        const pickupCoordinate = normalizeCoordinate(order.pickupCoordinate);
        const dropoffCoordinate =
          normalizeCoordinate(order.dropoffCoordinate) ??
          normalizeCoordinate(order.deliveryAddress?.coordinates);

        const normalizedStatus = normalizeStatus(order.status);
        console.log(
          `Order ${order._id}: Original status = ${order.status}, Normalized = ${normalizedStatus}, isReviewed = ${hasReviewed}, customerReview =`,
          customerReview
        );

        return {
          id: order._id,
          restaurantName: order.restaurant?.name || "Nhà hàng",
          items,
          total: order.total ?? order.totalAmount ?? 0,
          status: normalizedStatus,
          createdAt: order.createdAt,
          deliveryAddress: formatDeliveryAddress(order.deliveryAddress),
          pickupCoordinate,
          dropoffCoordinate,
          unlockPin: order.unlockPin,
          isReviewed: hasReviewed,
          rating: customerReview?.rating ?? null,
          reviewComment: customerReview?.comment ?? "",
        };
      });

      dispatch(setOrders(transformedOrders));
    } catch (error: any) {
      // Chỉ log lỗi nếu không phải lỗi authentication
      if (error?.message && !error.message.includes("đăng nhập")) {
        console.error("Failed to fetch orders:", error);
      }
    } finally {
      setOrdersLoading(false);
      isFetchingRef.current = false;
    }
  }, [dispatch]);

  // Fetch orders when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();

      // Set up interval to refresh orders every 10 seconds when screen is focused
      const intervalId = setInterval(() => {
        fetchOrders();
      }, 10000);

      // Cleanup interval when screen loses focus
      return () => {
        clearInterval(intervalId);
      };
    }, [fetchOrders])
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          !["delivered", "completed", "cancelled"].includes(order.status)
      ),
    [orders]
  );

  const pendingReviewCount = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "delivered" && !order.isReviewed
      ).length,
    [orders]
  );

  const historyOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["delivered", "completed", "cancelled"].includes(order.status)
      ),
    [orders]
  );

  const getStatusInfo = (status: OrderType["status"] | string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return { label: "✓ Đã giao", style: styles.statusDelivered };
      case "delivering":
      case "shipping":
        return { label: "🚁 Đang giao", style: styles.statusDelivering };
      case "ready":
        return { label: "🚚 Sẵn sàng giao", style: styles.statusPreparing };
      case "confirmed":
        return { label: "✅ Đã xác nhận", style: styles.statusPreparing };
      case "cancelled":
        return { label: "✕ Đã hủy", style: styles.statusCancelled };
      case "pending":
      default:
        return { label: "⏳ Chờ xác nhận", style: styles.statusConfirmed };
    }
  };

  const renderStarRow = (
    rating: number,
    size = 14,
    onSelect?: (value: number) => void
  ) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((value) => {
        const iconName =
          rating >= value
            ? "star"
            : rating >= value - 0.5
            ? "star-half"
            : "star-outline";
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
    console.log("Opening review modal for order:", {
      id: order.id,
      status: order.status,
      isReviewed: order.isReviewed,
      restaurantName: order.restaurantName,
    });
    setSelectedOrder(order);
    setReviewRating(order.rating ?? 0);
    setReviewComment(order.reviewComment ?? "");
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedOrder(null);
    setReviewRating(0);
    setReviewComment("");
    setSubmittingReview(false);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) {
      return;
    }

    console.log("Attempting to submit review for order:", {
      orderId: selectedOrder.id,
      status: selectedOrder.status,
      rating: reviewRating,
    });

    // Cho phép đánh giá tất cả đơn trong lịch sử
    const historyStatuses = ["delivered", "completed", "cancelled"];
    if (!historyStatuses.includes(selectedOrder.status)) {
      console.error("Cannot review order with status:", selectedOrder.status);
      Alert.alert(
        "Không thể đánh giá",
        `Chỉ có thể đánh giá đơn hàng trong lịch sử. Status hiện tại: ${selectedOrder.status}`
      );
      closeReviewModal();
      return;
    }

    if (reviewRating === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá.");
      return;
    }
    const trimmedComment = reviewComment.trim();
    const payload: {
      orderId: string;
      rating: number;
      comment?: string;
      productId?: string;
    } = {
      orderId: selectedOrder.id,
      rating: reviewRating,
    };
    if (trimmedComment) {
      payload.comment = trimmedComment;
    }
    const primaryProductId = selectedOrder.items?.[0]?.id;
    if (primaryProductId) {
      payload.productId = primaryProductId;
    }

    try {
      setSubmittingReview(true);
      await reviewAPI.create(payload);
      dispatch(
        submitOrderReview({
          id: selectedOrder.id,
          rating: reviewRating,
          comment: trimmedComment,
        })
      );
      await fetchOrders();
      Alert.alert("Cảm ơn bạn!", "Đánh giá đã được ghi nhận.");
      closeReviewModal();
    } catch (error: any) {
      const message =
        error?.message || "Không thể gửi đánh giá. Vui lòng thử lại.";
      Alert.alert("Không thành công", message);
      console.error("Failed to submit review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderItemsPreview = (order: OrderType) => (
    <View style={styles.orderItems}>
      {order.items.slice(0, 2).map((orderItem, idx) => (
        <Text
          key={orderItem.id ?? `${order.id}-${idx}`}
          style={styles.itemText}
        >
          {`${orderItem.quantity}x ${orderItem.name}`}
        </Text>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>{`và ${
          order.items.length - 2
        } món khác`}</Text>
      )}
    </View>
  );

  const renderActiveOrder = ({ item }: { item: OrderType }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate("OrderTracking", { orderId: item.id })
        }
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
            {String(new Date(item.createdAt).toLocaleDateString("vi-VN"))}
          </Text>
          <Text style={styles.orderTotal}>{`${item.total.toLocaleString(
            "vi-VN"
          )}đ`}</Text>
        </View>
        <View style={styles.orderActions}>
          <Ionicons
            name="navigate-outline"
            size={16}
            color="#EA5034"
            style={styles.orderActionIcon}
          />
          <Text style={styles.orderActionText}>Theo dõi hành trình</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistoryOrder = ({ item }: { item: OrderType }) => {
    const statusInfo = getStatusInfo(item.status);
    // Cho phép đánh giá tất cả đơn trong lịch sử (delivered, completed, cancelled)
    const canReview = !item.isReviewed;

    console.log(
      `📋 History Order ${item.id}: status=${item.status}, isReviewed=${item.isReviewed}, canReview=${canReview}`
    );

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{item.restaurantName}</Text>
          <View style={[styles.statusBadge, statusInfo.style]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>
        {renderItemsPreview(item)}
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>
            {String(new Date(item.createdAt).toLocaleDateString("vi-VN"))}
          </Text>
          <Text style={styles.orderTotal}>{`${item.total.toLocaleString(
            "vi-VN"
          )}đ`}</Text>
        </View>
        <View style={styles.historyReviewRow}>
          {item.isReviewed ? (
            <View style={styles.historyRatingGroup}>
              {renderStarRow(item.rating ?? 0)}
              <Text style={styles.historyRatingText}>{`${(
                item.rating ?? 0
              ).toFixed(1)}/5`}</Text>
            </View>
          ) : (
            <Text style={styles.pendingReviewText}>Chưa có đánh giá</Text>
          )}
          <TouchableOpacity
            style={styles.reviewButtonGhost}
            onPress={() => openReviewModal(item)}
          >
            <Text style={styles.reviewButtonGhostText}>
              {item.isReviewed ? "Sửa đánh giá" : "Đánh giá"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    if (ordersLoading && orders.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA5034" />
        </View>
      );
    }

    switch (activeTab) {
      case "active":
        if (activeOrders.length === 0) {
          return renderEmptyState(
            "📦",
            "Chưa có đơn đang xử lý",
            "Khi đặt món, đơn sẽ hiển thị tại đây.",
            {
              label: "Khám phá món ngon",
              onPress: () => navigation.navigate("Home"),
            }
          );
        }
        return (
          <FlatList
            data={activeOrders}
            renderItem={({ item }) => (
              <View
                style={
                  isLandscape && numColumns > 1
                    ? { width: cardWidth, marginRight: 12 }
                    : undefined
                }
              >
                {renderActiveOrder({ item })}
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { padding: containerPadding },
            ]}
            showsVerticalScrollIndicator={false}
            numColumns={numColumns}
            key={`active-${numColumns}`}
          />
        );
      case "history":
        if (historyOrders.length === 0) {
          return renderEmptyState(
            "🕑",
            "Chưa có lịch sử đơn hàng",
            "Đơn hàng đã giao sẽ được lưu lại giúp bạn đặt lại nhanh."
          );
        }
        return (
          <FlatList
            data={historyOrders}
            renderItem={({ item }) => (
              <View
                style={
                  isLandscape && numColumns > 1
                    ? { width: cardWidth, marginRight: 12 }
                    : undefined
                }
              >
                {renderHistoryOrder({ item })}
              </View>
            )}
            keyExtractor={(item) => `${item.id}-history`}
            contentContainerStyle={[
              styles.listContent,
              { padding: containerPadding },
            ]}
            showsVerticalScrollIndicator={false}
            numColumns={numColumns}
            key={`history-${numColumns}`}
            ListHeaderComponent={
              pendingReviewCount > 0 ? (
                <View
                  style={[
                    styles.reviewReminder,
                    { marginHorizontal: numColumns > 1 ? 0 : 0 },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={14}
                    color="#EA5034"
                    style={styles.reviewReminderIcon}
                  />
                  <Text style={styles.reviewReminderText}>
                    {`Bạn còn ${pendingReviewCount} đơn chờ đánh giá.`}
                  </Text>
                </View>
              ) : null
            }
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Đang xử lý
          </Text>
          {activeOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.tabTextActive,
            ]}
          >
            Lịch sử
          </Text>
          {historyOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{historyOrders.length}</Text>
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
              {selectedOrder?.restaurantName ?? ""}
            </Text>
            {renderStarRow(reviewRating, 24, (value) => setReviewRating(value))}
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
                style={[
                  styles.modalButton,
                  styles.modalButtonSecondary,
                  submittingReview && styles.modalButtonDisabled,
                ]}
                onPress={closeReviewModal}
                disabled={submittingReview}
              >
                <Text style={styles.modalButtonSecondaryText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  submittingReview && styles.modalButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>
                    Gửi đánh giá
                  </Text>
                )}
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
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomColor: "#EA5034",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#EA5034",
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: "#EA5034",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  listContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 0,
    maxWidth: "100%",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    flexShrink: 0,
  },
  statusDelivered: {
    backgroundColor: "#E8F5E9",
  },
  statusDelivering: {
    backgroundColor: "#E3F2FD",
  },
  statusConfirmed: {
    backgroundColor: "#EDE7F6",
  },
  statusShipping: {
    backgroundColor: "#E3F2FD",
  },
  statusPreparing: {
    backgroundColor: "#FFF3E0",
  },
  statusCancelled: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#666",
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderDate: {
    fontSize: 13,
    color: "#999",
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#EA5034",
  },
  orderActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  orderActionIcon: {
    marginRight: 6,
  },
  orderActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EA5034",
  },
  savedCartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA726",
  },
  savedCartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  savedRestaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  savedDate: {
    fontSize: 12,
    color: "#999",
  },
  savedCartBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  savedCartBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
  },
  savedCartItems: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  savedItemText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  savedCartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  savedCartTotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  savedCartActions: {
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  restoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EA5034",
  },
  restoreButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  reviewReminder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  reviewReminderIcon: {
    marginRight: 8,
  },
  reviewReminderText: {
    fontSize: 13,
    color: "#9C6F19",
    fontWeight: "600",
  },
  historyReviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  historyRatingGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  historyRatingText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 6,
    fontWeight: "600",
  },
  pendingReviewText: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    flexShrink: 1,
  },
  reviewButtonGhost: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EA5034",
    flexShrink: 0,
  },
  reviewButtonGhostText: {
    color: "#EA5034",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#EA5034",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#EA5034",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#333",
    marginTop: 12,
    maxHeight: 150,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonSecondary: {
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },
  modalButtonPrimary: {
    backgroundColor: "#EA5034",
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "600",
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
  },
});

export default OrdersScreen;
