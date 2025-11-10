import React, { useMemo } from 'react';
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
import { mockProducts } from '../data/mockData';

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
    return products.map((item: any, index: number) => {
      const derivedRating = item.rating ?? Math.max(3.8, Math.min(5, baseRating - 0.1 + (index % 4) * 0.15));
      const derivedReviews = item.reviewCount ?? (baseOrders > 0 ? Math.max(25, Math.round(baseOrders * 0.25) + index * 12) : 48 + index * 9);
      return {
        ...item,
        rating: Number(derivedRating.toFixed(1)),
        reviewCount: derivedReviews,
      };
    });
  }, [products, restaurant]);
  const restaurantReviewCount = restaurant.orders ?? 0;

  const handleAddToCart = (product: any) => {
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

  const renderProductCard = (product: any) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
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
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhà hàng</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
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

      <ScrollView 
        style={[styles.scrollView, { overflow: 'scroll' } as any]}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Restaurant Header */}
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
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
          {enrichedProducts.map(renderProductCard)}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#EA5034',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    position: 'relative',
    padding: 4,
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
