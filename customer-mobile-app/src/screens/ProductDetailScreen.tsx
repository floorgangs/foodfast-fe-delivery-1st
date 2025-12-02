import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../store";
import { reviewAPI } from "../services/api";
import type { AppDispatch } from "../store";

const { width } = Dimensions.get("window");

const DEBUG_IMAGES = true; // set to false to hide debug URIs
const resolveRestaurantImage = (restaurant: any) =>
  restaurant?.image || restaurant?.coverImage || restaurant?.avatar || "";

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product, restaurant } = route.params as {
    product: any;
    restaurant: any;
  };
  const restaurantImageUri = resolveRestaurantImage(restaurant);
  const PLACEHOLDER_IMAGE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l8GAAAAHUlEQVR4nGNgGAWjYBSMglEwCkbGhoYGBgYGBgAAMaQF4nKp8OAAAAAElFTkSuQmCC";
  const images = useMemo(() => {
    const collected: string[] = [];
    if (Array.isArray(product.images)) {
      collected.push(
        ...product.images.filter(
          (item: any) => typeof item === "string" && item.trim().length > 0
        )
      );
    }
    if (typeof product.image === "string" && product.image.trim().length > 0) {
      collected.push(product.image);
    }
    const unique = Array.from(new Set(collected));
    if (!unique.length && restaurantImageUri) {
      unique.push(restaurantImageUri);
    }
    if (!unique.length) {
      unique.push(PLACEHOLDER_IMAGE);
    }
    return unique;
  }, [product.images, product.image, restaurantImageUri]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImageIndexes, setFailedImageIndexes] = useState<
    Record<number, boolean>
  >({});
  const scrollRef = useRef<ScrollView | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const price = product.price ?? 0;
  const productId = (product._id || product.id || "").toString();
  const restaurantId = (restaurant._id || restaurant.id || "").toString();
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: product.rating ?? 0,
    totalReviews: product.totalReviews ?? product.reviewCount ?? 0,
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // nếu chưa đăng nhập, chuyển tới màn hình Login và truyền item đang chờ
      navigation.navigate("Login", { pendingAdd: { product, restaurant } });
      return;
    }

    // Thêm 1 món vào giỏ (số lượng mặc định 1)
    try {
      await (dispatch(
        addToCart({
          id: productId || product.id || `${Date.now()}`,
          productId: productId || product.id || `${Date.now()}`,
          name: product.name,
          price,
          restaurantId,
          restaurantName: restaurant.name,
          image: images[0] || restaurantImageUri || PLACEHOLDER_IMAGE,
        })
      ) as any);
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể lưu giỏ hàng");
    }
  };

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const formatReviewDate = (value?: string) => {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return value;
    }
  };

  const loadReviewData = async () => {
    if (!productId) {
      setLoadingReviews(false);
      return;
    }
    try {
      setLoadingReviews(true);
      const [summaryRes, listRes] = await Promise.all([
        reviewAPI.getSummary({ productId }),
        reviewAPI.getAll({ productId, limit: 6 }),
      ]);

      const summaryPayload = summaryRes?.data ?? {};
      setReviewSummary({
        averageRating: summaryPayload.averageRating ?? product.rating ?? 0,
        totalReviews:
          summaryPayload.totalReviews ??
          product.totalReviews ??
          product.reviewCount ??
          0,
      });

      const reviewList = Array.isArray(listRes?.data) ? listRes.data : [];
      setReviews(reviewList);
    } catch (error) {
      console.error("Error loading product reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviewData();
  }, [productId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          ref={scrollRef}
        >
          {images.map((uri: string, idx: number) => {
            const fallbackUri = restaurantImageUri || PLACEHOLDER_IMAGE;
            const displayUri = failedImageIndexes[idx] ? fallbackUri : uri;

            return (
              <React.Fragment key={idx}>
                <Image
                  source={{ uri: displayUri }}
                  style={styles.heroImage}
                  resizeMode="cover"
                  onError={() => {
                    if (
                      !failedImageIndexes[idx] &&
                      displayUri !== PLACEHOLDER_IMAGE
                    ) {
                      console.error(
                        "Hero onError for index",
                        idx,
                        "uri",
                        displayUri
                      );
                      setFailedImageIndexes((prev) => ({
                        ...prev,
                        [idx]: true,
                      }));
                    }
                  }}
                  onLoadEnd={() =>
                    console.log("Hero onLoadEnd index", idx, "uri", displayUri)
                  }
                />
                {DEBUG_IMAGES && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#888",
                      paddingHorizontal: 8,
                      marginTop: 6,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {displayUri}
                  </Text>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>

        <View style={styles.imageDots}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View>
              <Text style={styles.price}>
                {String(price.toLocaleString("vi-VN"))}đ
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                {/* Rating and reviews count */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const iconName =
                      (reviewSummary.averageRating ?? 0) >= i + 1
                        ? "star"
                        : (reviewSummary.averageRating ?? 0) >= i + 0.5
                        ? "star-half"
                        : "star-outline";
                    return (
                      <Ionicons
                        key={i}
                        name={iconName as any}
                        size={14}
                        color="#FFB800"
                        style={{ marginRight: 4 }}
                      />
                    );
                  })}
                  <Text style={{ marginLeft: 6, fontWeight: "600" }}>
                    {String((reviewSummary.averageRating ?? 0).toFixed(1))}
                  </Text>
                  <Text style={{ marginLeft: 6, color: "#777" }}>
                    (
                    {String(
                      (reviewSummary.totalReviews ?? 0).toLocaleString("vi-VN")
                    )}
                    )
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#777", fontSize: 12 }}>Lượt bán</Text>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                {String(
                  (product.sold ?? product.sales ?? 0).toLocaleString("vi-VN")
                )}
              </Text>
            </View>
          </View>

          {/* Reviews / Comments section */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              Đánh giá và bình luận
            </Text>
            {loadingReviews ? (
              <View style={styles.productReviewLoading}>
                <ActivityIndicator size="small" color="#EA5034" />
                <Text style={styles.productReviewLoadingText}>
                  Đang tải đánh giá...
                </Text>
              </View>
            ) : reviews.length === 0 ? (
              <Text style={styles.productReviewEmpty}>
                Chưa có đánh giá cho món ăn này.
              </Text>
            ) : (
              reviews.map((c: any) => (
                <View key={c._id || c.id} style={styles.productReviewItem}>
                  <View style={styles.productReviewHeader}>
                    <View style={styles.productReviewAvatar}>
                      <Text style={styles.productReviewAvatarText}>
                        {(c.customer?.name || c.user || "U").charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productReviewName}>
                        {c.customer?.name || c.user || "Ẩn danh"}
                      </Text>
                      <View style={styles.productReviewStarRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={
                              i < Math.round(c.rating ?? 0)
                                ? "star"
                                : "star-outline"
                            }
                            size={12}
                            color="#FFB800"
                          />
                        ))}
                        <Text style={styles.productReviewDate}>
                          {formatReviewDate(c.createdAt || c.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.productReviewComment}>
                    {c.comment || c.text}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingBar}>
        <View>
          <Text style={styles.totalLabel}>Tổng</Text>
          <Text style={styles.totalPrice}>
            {String(price.toLocaleString("vi-VN"))}đ
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
          <Ionicons
            name="cart"
            size={18}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  back: { padding: 6 },
  backText: { fontSize: 20, color: "#333" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  content: { flex: 1 },
  heroImage: { width, height: width * 0.6, resizeMode: "cover" },
  imageDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#EA5034" },
  card: { padding: 16, backgroundColor: "#fff", marginTop: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  description: { color: "#666", marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  price: { fontSize: 18, fontWeight: "800", color: "#EA5034" },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { fontSize: 18, color: "#333" },
  qtyText: { minWidth: 28, textAlign: "center", fontWeight: "700" },
  optionLabel: { fontWeight: "600", color: "#333", marginBottom: 8 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap" as any, gap: 8 },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  optionPillActive: { backgroundColor: "#EA5034", borderColor: "#EA5034" },
  optionText: { color: "#333" },
  optionTextActive: { color: "#fff" },
  noteTitle: { fontWeight: "700" },
  noteText: { color: "#666", marginTop: 6 },
  floatingBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
  },
  totalLabel: { color: "#999", fontSize: 12 },
  totalPrice: { fontWeight: "700", fontSize: 16 },
  addBtn: {
    backgroundColor: "#EA5034",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  productReviewLoading: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  productReviewLoadingText: { marginLeft: 10, color: "#777" },
  productReviewEmpty: { color: "#777", fontStyle: "italic" },
  productReviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productReviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  productReviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productReviewAvatarText: { fontWeight: "700", fontSize: 16, color: "#333" },
  productReviewName: { fontWeight: "700", color: "#333" },
  productReviewStarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  productReviewDate: { marginLeft: 8, color: "#999", fontSize: 12 },
  productReviewComment: { color: "#444", lineHeight: 18 },
});
