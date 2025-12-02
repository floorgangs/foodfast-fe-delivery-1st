import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import type { AppDispatch } from "../store";
import useResponsive from "../hooks/useResponsive";

const CartScreen = ({ navigation }: any) => {
  const { isLandscape, numColumns, containerPadding, cardWidth } =
    useResponsive();
  const { items, total, isSyncing } = useSelector(
    (state: RootState) => state.cart
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await dispatch(updateQuantity({ id: productId, quantity }));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật giỏ hàng");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể cập nhật giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    navigation.navigate("Checkout");
  };

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{`${item.price.toLocaleString(
          "vi-VN"
        )}đ`}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{String(item.quantity)}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>{`${(
            item.price * item.quantity
          ).toLocaleString("vi-VN")}đ`}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          {items.length > 0 && (
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{String(items.length)}</Text>
            </View>
          )}
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Xóa tất cả",
                "Bạn có chắc muốn xóa tất cả sản phẩm?",
                [
                  { text: "Hủy", style: "cancel" },
                  {
                    text: "Xóa",
                    onPress: async () => {
                      try {
                        await (dispatch(clearCart()) as any);
                      } catch (error: any) {
                        Alert.alert(
                          "Lỗi",
                          error?.message || "Không thể xóa giỏ hàng"
                        );
                      }
                    },
                    style: "destructive",
                  },
                ]
              )
            }
          >
            <Text style={styles.clearButton}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
        {items.length === 0 && <View style={{ width: 40 }} />}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={styles.emptyCartIconContainer}>
            <Text style={styles.emptyCartIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyCartTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyCartSubtitle}>
            Hãy thêm món ăn yêu thích vào giỏ hàng nhé!
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <View
                style={
                  isLandscape && numColumns > 1
                    ? { width: cardWidth, marginRight: 12 }
                    : undefined
                }
              >
                {renderCartItem({ item })}
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.cartList,
              { padding: containerPadding },
            ]}
            numColumns={numColumns}
            key={`cart-${numColumns}`}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalAmount}>{`${total.toLocaleString(
                "vi-VN"
              )}đ`}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                isSyncing && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCheckout}
              disabled={isSyncing}
            >
              <Text style={styles.checkoutButtonText}>Tiến hành đặt hàng</Text>
              <Text style={styles.checkoutButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "600",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  itemCountBadge: {
    backgroundColor: "#EA5034",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  itemCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  clearButton: {
    fontSize: 14,
    color: "#EA5034",
    fontWeight: "600",
  },
  cartList: {
    padding: 12,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: "#EA5034",
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityButtonText: {
    color: "#EA5034",
    fontSize: 20,
    fontWeight: "600",
  },
  quantity: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 20,
    color: "#999",
    lineHeight: 20,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyCartIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF0ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyCartIcon: {
    fontSize: 60,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
  emptyCartSubtitle: {
    fontSize: 15,
    color: "#999",
    marginBottom: 32,
    textAlign: "center",
  },
  continueButton: {
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
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EA5034",
  },
  checkoutButton: {
    backgroundColor: "#EA5034",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EA5034",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
  },
  checkoutButtonArrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default CartScreen;
