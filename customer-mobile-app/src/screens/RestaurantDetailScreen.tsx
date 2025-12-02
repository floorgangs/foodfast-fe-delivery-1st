import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { addToCart } from "../store/slices/cartSlice";
import { RootState } from "../store";
import type { AppDispatch } from "../store";
import { productAPI, reviewAPI } from "../services/api";
import useResponsive from "../hooks/useResponsive";

const RATING_BREAKDOWN_TEMPLATE = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

const resolveRestaurantImage = (restaurant: any) =>
  restaurant?.image || restaurant?.coverImage || restaurant?.avatar || "";

const RestaurantDetailScreen = ({ route, navigation }: any) => {
  const { restaurant } = route.params;
  const { isLandscape, numColumns, containerPadding, cardWidth } =
    useResponsive();
  const dispatch = useDispatch<AppDispatch>();
  const { items, currentRestaurantId, currentRestaurantName } = useSelector(
    (state: RootState) => state.cart
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const restaurantId = (restaurant._id || restaurant.id || "").toString();
  const restaurantImageUri = resolveRestaurantImage(restaurant);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: restaurant.rating ?? 0,
    totalReviews: restaurant.totalReviews ?? restaurant.orders ?? 0,
    breakdown: { ...RATING_BREAKDOWN_TEMPLATE },
  });
  const [latestReviews, setLatestReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadProducts();
    loadReviewData();
  }, [restaurantId]);

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

  const loadProducts = async () => {
    if (!restaurantId) {
      return;
    }
    try {
      setLoading(true);
      const response = await productAPI.getByRestaurant(restaurantId);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Lỗi", "Không thể tải menu nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  const loadReviewData = async () => {
    if (!restaurantId) {
      return;
    }
    try {
      setReviewLoading(true);
      const [summaryRes, listRes] = await Promise.all([
        reviewAPI.getSummary({ restaurantId }),
        reviewAPI.getAll({ restaurantId, limit: 5 }),
      ]);

      const summaryPayload = summaryRes?.data ?? {};
      setReviewSummary({
        averageRating: summaryPayload.averageRating ?? 0,
        totalReviews: summaryPayload.totalReviews ?? 0,
        breakdown: {
          ...RATING_BREAKDOWN_TEMPLATE,
          ...(summaryPayload.breakdown || {}),
        },
      });

      const reviewList = Array.isArray(listRes?.data) ? listRes.data : [];
      setLatestReviews(reviewList);
    } catch (error) {
      console.error("Error loading restaurant reviews:", error);
      setReviewSummary((prev) => ({
        averageRating: prev.averageRating,
        totalReviews: prev.totalReviews,
        breakdown: prev.breakdown,
      }));
      setLatestReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(), loadReviewData()]);
    setRefreshing(false);
  };

  const renderStarRow = (rating: number, size = 14) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((value) => {
        const iconName =
          rating >= value
            ? "star"
            : rating >= value - 0.5
            ? "star-half"
            : "star-outline";
        return (
          <Ionicons
            key={value}
            name={iconName as any}
            size={size}
            color="#FFB800"
            style={styles.starIcon}
          />
        );
      })}
    </View>
  );

  const enrichedProducts = useMemo(() => {
    return products.map((item: any) => {
      const itemRating = typeof item.rating === "number" ? item.rating : 0;
      const reviewCount = item.totalReviews ?? item.reviewCount ?? 0;
      const productId = item._id || item.id;
      return {
        ...item,
        id: productId,
        rating: Number(Number(itemRating).toFixed(1)),
        reviewCount,
      };
    });
  }, [products]);

  // Pagination logic
  const totalPages = Math.ceil(enrichedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return enrichedProducts.slice(startIndex, endIndex);
  }, [enrichedProducts, currentPage, ITEMS_PER_PAGE]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  const restaurantReviewCount = reviewSummary.totalReviews ?? 0;

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Cần đăng nhập",
        "Vui lòng đăng nhập để thêm món vào giỏ hàng.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () =>
              navigation.navigate("Login", {
                pendingAdd: { product, restaurant },
              }),
          },
        ]
      );
      return;
    }

    const attemptAdd = async () => {
      try {
        await (dispatch(
          addToCart({
            id: (product._id || product.id || `${Date.now()}`).toString(),
            productId: (
              product._id ||
              product.id ||
              `${Date.now()}`
            ).toString(),
            name: product.name,
            price: product.price ?? 0,
            restaurantId,
            restaurantName: restaurant.name,
            image: product.image || restaurantImageUri,
          })
        ) as any);
        Alert.alert("Thành công", "Đã thêm món ăn vào giỏ hàng!");
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể lưu giỏ hàng");
      }
    };

    // Kiểm tra nếu giỏ hàng có món từ nhà hàng khác
    if (
      items.length > 0 &&
      currentRestaurantId &&
      currentRestaurantId !== restaurantId
    ) {
      Alert.alert(
        "Thay đổi nhà hàng",
        `Giỏ hàng đang có món từ "${currentRestaurantName}". Món ăn hiện tại sẽ được lưu vào "Đơn tạm" trong phần đơn hàng. Bạn có muốn tiếp tục?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Tiếp tục",
            onPress: () => {
              attemptAdd();
            },
          },
        ]
      );
    } else {
      attemptAdd();
    }
  };

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const PLACEHOLDER_IMAGE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l8GAAAAHUlEQVR4nGNgGAWjYBSMglEwCkbGhoYGBgYGBgAAMaQF4nKp8OAAAAAElFTkSuQmCC";

  const renderProductCard = (product: any) => {
    const productId = (
      product.id ||
      product._id ||
      `${product.name}-${restaurantId}`
    ).toString();
    const ratingValue = Number(product.rating ?? 0);
    const totalReviews = product.reviewCount ?? product.totalReviews ?? 0;
    const productPrice = product.price ?? 0;
    const fallbackImageUri = restaurantImageUri || PLACEHOLDER_IMAGE;
    const baseImageUri = product.image || fallbackImageUri;
    const displayImageUri = failedImages[productId]
      ? fallbackImageUri
      : baseImageUri;

    return (
      <TouchableOpacity
        key={productId}
        style={styles.productCard}
        onPress={() =>
          navigation.navigate("ProductDetail", { product, restaurant })
        }
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: displayImageUri }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => {
            if (
              !failedImages[productId] &&
              displayImageUri !== PLACEHOLDER_IMAGE
            ) {
              setFailedImages((prev) => ({ ...prev, [productId]: true }));
            }
          }}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productRatingRow}>
            {renderStarRow(ratingValue)}
            <Text style={styles.productRatingValue}>
              {String(ratingValue.toFixed(1))}
            </Text>
            <Text style={styles.productRatingCount}>
              ({String(totalReviews.toLocaleString("vi-VN"))})
            </Text>
          </View>
          <Text style={styles.productDescription}>
            {String(product.description || "")}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              {String(productPrice.toLocaleString("vi-VN"))}đ
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(product)}
            >
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const [failedRestaurantImage, setFailedRestaurantImage] = useState(false);
  const resolvedRestaurantHero = failedRestaurantImage
    ? PLACEHOLDER_IMAGE
    : restaurantImageUri || PLACEHOLDER_IMAGE;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhà hàng</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={styles.cartButton}
        >
          <Ionicons name="cart-outline" size={26} color="#333" />
          {items.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA5034" />
          <Text style={styles.loadingText}>Đang tải menu...</Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.scrollView, { overflow: "scroll" } as any]}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Restaurant Header */}
          <Image
            source={{ uri: resolvedRestaurantHero }}
            style={styles.restaurantImage}
            resizeMode="cover"
            onError={() => {
              if (!failedRestaurantImage) {
                setFailedRestaurantImage(true);
              }
            }}
          />
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantDescription}>
              {restaurant.description}
            </Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.restaurantMetaLeft}>
                <View style={styles.restaurantRatingRow}>
                  {renderStarRow(reviewSummary.averageRating ?? 0, 16)}
                  <Text style={styles.restaurantRatingValue}>
                    {(reviewSummary.averageRating ?? 0).toFixed(1)}
                  </Text>
                  <Text style={styles.restaurantRatingCount}>
                    ({String(restaurantReviewCount.toLocaleString("vi-VN"))}{" "}
                    đánh giá)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.showReviewsButton}
                  onPress={() => setShowReviews((prev) => !prev)}
                >
                  <Text style={styles.showReviewsText}>
                    {showReviews ? "Thu gọn đánh giá" : "Xem thêm đánh giá"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.deliveryTime}>
                🚁{" "}
                {String(
                  restaurant.estimatedDeliveryTime ||
                    restaurant.deliveryTime ||
                    "25-35 phút"
                )}
              </Text>
            </View>
          </View>

          {showReviews ? (
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>Đánh giá gần đây</Text>
              <View style={styles.reviewSummaryRow}>
                <View style={styles.reviewSummaryLeft}>
                  <Text style={styles.reviewSummaryRating}>
                    {(reviewSummary.averageRating ?? 0).toFixed(1)}
                  </Text>
                  <View style={styles.reviewSummaryStars}>
                    {renderStarRow(reviewSummary.averageRating ?? 0, 14)}
                  </View>
                </View>
                <Text style={styles.reviewSummaryCount}>
                  {String(restaurantReviewCount.toLocaleString("vi-VN"))} lượt
                  đánh giá
                </Text>
              </View>
              {reviewLoading ? (
                <View style={styles.reviewLoadingContainer}>
                  <ActivityIndicator size="small" color="#EA5034" />
                  <Text style={styles.reviewLoadingText}>
                    Đang tải đánh giá...
                  </Text>
                </View>
              ) : latestReviews.length === 0 ? (
                <Text style={styles.reviewEmptyText}>
                  Chưa có đánh giá cho nhà hàng này.
                </Text>
              ) : (
                latestReviews.map((review: any, index: number) => (
                  <View
                    key={review._id || review.id || `${index}`}
                    style={[
                      styles.reviewItem,
                      index === 0 && styles.reviewItemFirst,
                    ]}
                  >
                    <View style={styles.reviewItemHeader}>
                      <Text style={styles.reviewAuthor}>
                        {review.customer?.name || "Ẩn danh"}
                      </Text>
                      <View style={styles.reviewItemStars}>
                        {renderStarRow(review.rating ?? 0, 12)}
                        <Text style={styles.reviewItemRating}>
                          {(review.rating ?? 0).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewItemDate}>
                      {formatReviewDate(review.createdAt)}
                    </Text>
                    <Text style={styles.reviewItemComment}>
                      {review.comment}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : null}

          {/* Menu */}
          <View style={styles.menuSection}>
            <View style={styles.menuHeader}>
              <Text style={styles.sectionTitle}>Thực đơn</Text>
              {enrichedProducts.length > ITEMS_PER_PAGE && (
                <Text style={styles.menuCount}>
                  {enrichedProducts.length} món ăn
                </Text>
              )}
            </View>

            <View
              style={[
                isLandscape &&
                  numColumns > 1 && {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginHorizontal: -6,
                  },
              ]}
            >
              {paginatedProducts.map((product) => (
                <View
                  key={product.id || product._id}
                  style={
                    isLandscape && numColumns > 1
                      ? { width: "48%", marginHorizontal: "1%" }
                      : undefined
                  }
                >
                  {renderProductCard(product)}
                </View>
              ))}
            </View>

            {/* Pagination Controls */}
            {enrichedProducts.length > ITEMS_PER_PAGE && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === 1 && styles.paginationButtonDisabled,
                  ]}
                  onPress={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentPage === 1 ? "#ccc" : "#EA5034"}
                  />
                </TouchableOpacity>

                <View style={styles.paginationPages}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <TouchableOpacity
                        key={page}
                        style={[
                          styles.paginationPageButton,
                          page === currentPage &&
                            styles.paginationPageButtonActive,
                        ]}
                        onPress={() => handlePageSelect(page)}
                      >
                        <Text
                          style={[
                            styles.paginationPageText,
                            page === currentPage &&
                              styles.paginationPageTextActive,
                          ]}
                        >
                          {page}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    currentPage === totalPages &&
                      styles.paginationButtonDisabled,
                  ]}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentPage === totalPages ? "#ccc" : "#EA5034"}
                  />
                </TouchableOpacity>
              </View>
            )}

            {enrichedProducts.length > ITEMS_PER_PAGE && (
              <Text style={styles.paginationInfo}>
                Đang hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  enrichedProducts.length
                )}{" "}
                trong {enrichedProducts.length} món
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 24,
    color: "#EA5034",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cartButton: {
    position: "relative",
    padding: 4,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#EA5034",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  restaurantImage: {
    width: "100%",
    height: 200,
  },
  restaurantHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantMetaLeft: {
    flex: 1,
    marginRight: 12,
  },
  showReviewsButton: {
    marginTop: 4,
  },
  showReviewsText: {
    fontSize: 12,
    color: "#EA5034",
    fontWeight: "500",
  },
  reviewSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  reviewSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reviewSummaryLeft: {
    alignItems: "flex-start",
  },
  reviewSummaryRating: {
    fontSize: 28,
    fontWeight: "700",
    color: "#EA5034",
  },
  reviewSummaryStars: {
    marginTop: 4,
  },
  reviewSummaryCount: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },
  reviewLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  reviewLoadingText: {
    marginLeft: 10,
    color: "#777",
    fontSize: 13,
  },
  reviewEmptyText: {
    color: "#777",
    fontSize: 13,
    paddingVertical: 8,
  },
  reviewItem: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reviewItemFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  reviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  reviewItemStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewItemRating: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  reviewItemDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#999",
  },
  reviewItemComment: {
    marginTop: 8,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  restaurantRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantRatingValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  restaurantRatingCount: {
    fontSize: 13,
    color: "#777",
    marginLeft: 6,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#EA5034",
    fontWeight: "500",
  },
  menuSection: {
    padding: 16,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuCount: {
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EA5034",
    marginHorizontal: 8,
  },
  paginationButtonDisabled: {
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  paginationPages: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  paginationPageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paginationPageButtonActive: {
    backgroundColor: "#EA5034",
    borderColor: "#EA5034",
  },
  paginationPageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  paginationPageTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  paginationInfo: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginTop: 8,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  productRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  productRatingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  productRatingCount: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EA5034",
  },
  addButton: {
    backgroundColor: "#EA5034",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

export default RestaurantDetailScreen;
