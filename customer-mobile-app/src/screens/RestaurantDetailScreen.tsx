import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { addToCart } from '../store/slices/cartSlice';
import { RootState } from '../store';
import { mockProducts, productCategories } from '../data/mockData';

const RestaurantDetailScreen = ({ route, navigation }: any) => {
  const { restaurant } = route.params;
  const dispatch = useDispatch();
  const { items, currentRestaurantId, currentRestaurantName } = useSelector((state: RootState) => state.cart);
  const products = mockProducts[restaurant.id] || [];

  const renderStarRow = (rating: number, size = 14) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(value => {
        const iconName = rating >= value ? 'star' : rating >= value - 0.5 ? 'star-half' : 'star-outline';
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
    const baseRating = restaurant.rating ?? 4.5;
    const baseOrders = restaurant.orders ?? 120;
    const categoryMap = productCategories[restaurant.id] || {};

    return products.map((item: any, index: number) => {
      const derivedRating = item.rating ?? Math.max(3.8, Math.min(5, baseRating - 0.1 + (index % 4) * 0.15));
      const derivedReviews = item.reviewCount ?? (baseOrders > 0 ? Math.max(25, Math.round(baseOrders * 0.25) + index * 12) : 48 + index * 9);
      const category = categoryMap[item.id] ?? 'Danh mục khác';

      return {
        ...item,
        rating: Number(derivedRating.toFixed(1)),
        reviewCount: derivedReviews,
        category,
      };
    });
  }, [products, restaurant.id, restaurant.orders, restaurant.rating]);
  const restaurantReviewCount = restaurant.orders ?? 0;

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { pendingAdd: { product, restaurant } });
      return;
    }
    // Kiểm tra nếu giỏ hàng có món từ nhà hàng khác
    if (items.length > 0 && currentRestaurantId !== restaurant.id) {
      Alert.alert(
        'Thay đổi nhà hàng',
        `Giỏ hàng đang có món từ "${currentRestaurantName}". Món ăn hiện tại sẽ được lưu vào "Đơn tạm" trong phần đơn hàng. Bạn có muốn tiếp tục?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Tiếp tục',
            onPress: () => {
                      dispatch(addToCart({
                        ...product,
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                      }));
              Alert.alert('Thành công', 'Đã thêm món ăn vào giỏ hàng!');
            },
          },
        ]
      );
    } else {
              dispatch(addToCart({
                ...product,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              }));
              Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
    }
  };

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l8GAAAAHUlEQVR4nGNgGAWjYBSMglEwCkbGhoYGBgYGBgAAMaQF4nKp8OAAAAAElFTkSuQmCC';

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = ['Tất cả'];

    enrichedProducts.forEach(product => {
      const category = product.category ?? 'Danh mục khác';
      if (!seen.has(category)) {
        seen.add(category);
        list.push(category);
      }
    });

    return list;
  }, [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Tất cả') {
      return enrichedProducts;
    }

    return enrichedProducts.filter(product => product.category === selectedCategory);
  }, [enrichedProducts, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups = filteredProducts.reduce<Record<string, any[]>>((acc, product) => {
      const category = product.category ?? 'Danh mục khác';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    const orderedCategories = categoryOptions.filter(category => category !== 'Tất cả');

    return orderedCategories
      .filter(category => groups[category]?.length)
      .map(category => ({ category, items: groups[category] }));
  }, [filteredProducts, categoryOptions]);

  const renderProductCard = (product: any) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product, restaurant })}
      activeOpacity={0.9}
    >
      {failedImages[product.id] ? (
        // If product image failed, try to use restaurant image as fallback
        restaurant.image && restaurant.image !== product.image ? (
          <Image
            source={{ uri: restaurant.image }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setFailedImages(prev => ({ ...prev, [product.id]: true }))}
          />
        ) : (
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )
      ) : (
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setFailedImages(prev => ({ ...prev, [product.id]: true }))}
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.productRatingRow}>
          {renderStarRow(product.rating)}
          <Text style={styles.productRatingValue}>{product.rating.toFixed(1)}</Text>
          <Text style={styles.productRatingCount}>
            ({product.reviewCount.toLocaleString('vi-VN')})
          </Text>
        </View>
        <Text style={styles.productDescription}>{product.description}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
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

  const [failedRestaurantImage, setFailedRestaurantImage] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')}
          style={styles.headerIconButton}
        >
          <Ionicons name="chevron-back" size={24} color="#EA5034" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhà hàng</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          style={[styles.headerIconButton, styles.cartButton]}
        >
          <Ionicons name="cart-outline" size={26} color="#333" />
          {items.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={[styles.scrollView, { overflow: 'scroll' } as any]}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Restaurant Header */}
        {failedRestaurantImage || !restaurant.image ? (
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: restaurant.image }}
            style={styles.restaurantImage}
            resizeMode="cover"
            onError={() => setFailedRestaurantImage(true)}
          />
        )}
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          <View style={styles.restaurantMeta}>
            <View style={styles.restaurantRatingRow}>
              {renderStarRow(restaurant.rating ?? 0, 16)}
              <Text style={styles.restaurantRatingValue}>{(restaurant.rating ?? 0).toFixed(1)}</Text>
              <Text style={styles.restaurantRatingCount}>
                ({restaurantReviewCount.toLocaleString('vi-VN')}+ đánh giá)
              </Text>
            </View>
            <Text style={styles.deliveryTime}>🚁 {restaurant.deliveryTime}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Thực đơn</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {categoryOptions.map(category => {
              const isActive = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {groupedProducts.length === 0 ? (
            <Text style={styles.emptyStateText}>Danh mục này chưa có món ăn.</Text>
          ) : (
            groupedProducts.map(group => (
              <View key={group.category} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{group.category}</Text>
                {group.items.map(renderProductCard)}
              </View>
            ))
          )}
        </View>
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
  scrollView: {
    flex: 1,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 64,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EA5034',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  restaurantHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantRatingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  restaurantRatingCount: {
    fontSize: 13,
    color: '#777',
    marginLeft: 6,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#EA5034',
    fontWeight: '500',
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'left',
  },
  categoryTabs: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#EA5034',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: '#EA5034',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA5034',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  categoryBlock: {
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  productRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productRatingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  productRatingCount: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EA5034',
  },
  addButton: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;
