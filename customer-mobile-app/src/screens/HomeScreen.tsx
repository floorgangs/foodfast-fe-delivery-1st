import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { restaurantAPI, productAPI } from '../services/api';
import useResponsive from '../hooks/useResponsive';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32; // 16px padding on each side

const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l8GAAAAHUlEQVR4nGNgGAWjYBSMglEwCkbGhoYGBgYGBgAAMaQF4nKp8OAAAAAElFTkSuQmCC';

const coerceToString = (value: any, fallback = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  try {
    const stringified = String(value);
    return stringified === '[object Object]' ? fallback : stringified;
  } catch (_error) {
    return fallback;
  }
};

const coerceToNumber = (value: any, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.,-]/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const getRestaurantImageCandidates = (restaurant: any) => {
  const candidates = [
    restaurant?.coverImage, 
    restaurant?.image, 
    restaurant?.avatar
  ].filter((uri) => {
    if (typeof uri !== 'string' || !uri.trim()) return false;
    return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:');
  });
  
  return candidates.length > 0 ? [...candidates, PLACEHOLDER_IMAGE] : [PLACEHOLDER_IMAGE];
};

const resolveRestaurantImage = (restaurant: any) => {
  const [primary] = getRestaurantImageCandidates(restaurant);
  return primary || '';
};

const normalizeRestaurant = (restaurant: any) => {
  if (!restaurant || typeof restaurant !== 'object') {
    return {
      _id: `placeholder-${Date.now()}`,
      name: 'Nhà hàng',
      description: 'Giao nhanh - Chất lượng',
      rating: 4.5,
      orders: 0,
      estimatedDeliveryTime: '30-45 phút',
      deliveryTime: '30-45 phút',
      distance: 2,
      cuisine: [],
      vouchers: [],
      image: PLACEHOLDER_IMAGE,
    };
  }

  const cuisineList = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
        .map((item: any) => coerceToString(item))
        .filter((item: string) => item.trim().length > 0)
    : [];

  const rawDistance = restaurant.distance ?? restaurant.distanceInKm ?? restaurant.distanceKm;
  const distanceNumber = typeof rawDistance === 'number'
    ? rawDistance
    : coerceToNumber(rawDistance, NaN);

  const ordersNumber = coerceToNumber(restaurant.orders, NaN);
  const ratingNumber = coerceToNumber(restaurant.rating, NaN);

  const imageCandidates = getRestaurantImageCandidates(restaurant);
  const resolvedImage = imageCandidates[0] || resolveRestaurantImage(restaurant) || PLACEHOLDER_IMAGE;

  return {
    ...restaurant,
    name: coerceToString(restaurant.name, 'Nhà hàng').trim() || 'Nhà hàng',
    description: coerceToString(restaurant.description, 'Giao nhanh - Chất lượng'),
    rating: Number.isFinite(ratingNumber) ? ratingNumber : 4.5,
    orders: Number.isFinite(ordersNumber) ? ordersNumber : 0,
    estimatedDeliveryTime: coerceToString(
      restaurant.estimatedDeliveryTime ?? restaurant.deliveryTime,
      '30-45 phút'
    ),
    deliveryTime: coerceToString(
      restaurant.deliveryTime ?? restaurant.estimatedDeliveryTime,
      '30-45 phút'
    ),
    distance: Number.isFinite(distanceNumber) ? distanceNumber : 2,
    cuisine: cuisineList,
    vouchers: Array.isArray(restaurant.vouchers)
      ? restaurant.vouchers.filter(Boolean)
      : [],
    image: resolvedImage,
  };
};

const generateBannerFromRestaurant = (input: any) => {
  const restaurant = normalizeRestaurant(input);
  const img = resolveRestaurantImage(restaurant) || PLACEHOLDER_IMAGE;
  const title = coerceToString(restaurant.name, 'PARTNER').toUpperCase() || 'PARTNER';
  const subtitle = coerceToString(restaurant.description, 'Giao nhanh - Chất lượng');
  return {
    id: coerceToString(restaurant?._id ?? restaurant?.id ?? `banner-${Date.now()}`),
    title,
    subtitle,
    image: img,
  };
};

const HomeScreen = ({ navigation }: any) => {
  const { isLandscape, numColumns, containerPadding, width: screenWidth } = useResponsive();
  const [searchText, setSearchText] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('suggest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [restaurantImageFallbacks, setRestaurantImageFallbacks] = useState<Record<string, number>>({});

  // Calculate responsive card width
  const restaurantCardWidth = isLandscape && numColumns > 1 
    ? (screenWidth - containerPadding * 2 - 12 * (numColumns - 1)) / numColumns 
    : screenWidth - 32;

  // Load restaurants from API
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Search for products/restaurants when search text changes
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchText.trim().length > 0) {
        await searchProducts(searchText.trim());
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(delaySearch);
  }, [searchText]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll();
      
      const payload = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

      const normalizedList = Array.isArray(payload)
        ? payload.map((item, index) => {
            try {
              return normalizeRestaurant(item);
            } catch (err) {
              console.error(`[HomeScreen] Failed to normalize restaurant at index ${index}:`, err);
              return null;
            }
          }).filter(Boolean)
        : [];

      setRestaurants(normalizedList);
      setRestaurantImageFallbacks({});
      setActiveSlide(0);
    } catch (error) {
      console.error('[HomeScreen] Error loading restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const searchProducts = async (keyword: string) => {
    try {
      setIsSearching(true);
      const response = await productAPI.search(keyword);
      
      const products = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];

      // Group products by restaurant
      const restaurantMap = new Map();
      
      products.forEach((product: any) => {
        const restaurantId = product.restaurantId?._id || product.restaurantId;
        const restaurantData = typeof product.restaurantId === 'object' 
          ? product.restaurantId 
          : restaurants.find(r => r._id === restaurantId);

        if (restaurantData) {
          if (!restaurantMap.has(restaurantId)) {
            restaurantMap.set(restaurantId, {
              ...restaurantData,
              matchedProducts: []
            });
          }
          restaurantMap.get(restaurantId).matchedProducts.push(product);
        }
      });

      setSearchResults(Array.from(restaurantMap.values()));
    } catch (error) {
      console.error('[HomeScreen] Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter and sort restaurants based on selected filter and category
  const getFilteredRestaurants = () => {
    // If searching, return search results
    if (searchText.trim().length > 0 && searchResults.length > 0) {
      return searchResults.map(normalizeRestaurant);
    }

    const normalizedSearchText = searchText.trim().toLowerCase();
    const normalizedCategory = selectedCategory.trim().toLowerCase();

    const normalizedList = restaurants.map(normalizeRestaurant);

    let filtered = normalizedList.filter((restaurant) => {
      const nameLower = coerceToString(restaurant.name, '').toLowerCase();

      const matchesSearch = normalizedSearchText.length === 0
        ? true
        : nameLower.includes(normalizedSearchText);

      const matchesCategory = selectedCategory === 'all'
        ? true
        : restaurant.cuisine?.some((item: any) => coerceToString(item).toLowerCase() === normalizedCategory) ||
          nameLower.includes(normalizedCategory);

      return matchesSearch && matchesCategory;
    });

    if (selectedFilter === 'nearby') {
      filtered = [...filtered].sort((a, b) => {
        const distanceA = coerceToNumber(a.distance, Number.POSITIVE_INFINITY);
        const distanceB = coerceToNumber(b.distance, Number.POSITIVE_INFINITY);
        return distanceA - distanceB;
      });
    } else if (selectedFilter === 'bestseller') {
      filtered = [...filtered].sort((a, b) => {
        const ordersA = coerceToNumber(a.orders, 0);
        const ordersB = coerceToNumber(b.orders, 0);
        return ordersB - ordersA;
      });
    } else {
      filtered = [...filtered].sort((a, b) => {
        const ratingA = coerceToNumber(a.rating, 0);
        const ratingB = coerceToNumber(b.rating, 0);
        return ratingB - ratingA;
      });
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  const banners = useMemo(() => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return [];
    }
    return restaurants.slice(0, 6).map((restaurant) => {
      try {
        return generateBannerFromRestaurant(restaurant);
      } catch (err) {
        console.error('[HomeScreen] Failed to generate banner:', err);
        return {
          id: `error-banner-${Date.now()}-${Math.random()}`,
          title: 'PARTNER',
          subtitle: 'Giao nhanh',
          image: PLACEHOLDER_IMAGE,
        };
      }
    }).filter(Boolean);
  }, [restaurants]);

  // Auto scroll banner
  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % banners.length;
      setActiveSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * (BANNER_WIDTH + 16), // +16 for marginRight
        animated: true,
      });
    }, 3000); // Auto scroll every 3 seconds

    return () => clearInterval(interval);
  }, [activeSlide, banners.length]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16));
    setActiveSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      {/* Header - ShopeeFood style */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => navigation.navigate('Address')}
          >
            <Text style={styles.locationText}>Giao đến </Text>
            <Text style={styles.locationAddress}>Chọn địa chỉ giao hàng</Text>
            <Text style={styles.locationArrow}> ›</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          activeOpacity={1}
          onPress={() => searchInputRef.current?.focus()}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Tìm món ăn, nhà hàng..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#EA5034" style={{ marginLeft: 8 }} />
          ) : searchText.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
        
        {/* Search Results Info */}
        {searchText.trim().length > 0 && searchResults.length > 0 && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              Tìm thấy {searchResults.length} nhà hàng có món "{searchText}"
            </Text>
          </View>
        )}
      </View>

      {/* Main Content with Banner, Menu, Filter Tabs and Restaurant List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA5034" />
          <Text style={styles.loadingText}>Đang tải nhà hàng...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          stickyHeaderIndices={[2]}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Banner Carousel with Auto Scroll */}
        {banners && banners.length > 0 ? (
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.carouselScroll}
          >
            {banners.map((banner) => {
              const bannerId = coerceToString(banner?.id, `banner-${Math.random()}`);
              const bannerTitle = coerceToString(banner?.title, 'PARTNER');
              const bannerSubtitle = coerceToString(banner?.subtitle, 'Giao nhanh');
              const bannerImage = coerceToString(banner?.image, PLACEHOLDER_IMAGE);
              
              return (
              <View key={bannerId} style={styles.bannerSlide}>
                <Image 
                  source={{ uri: bannerImage }} 
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{bannerTitle}</Text>
                  <Text style={styles.bannerSubtitle}>{bannerSubtitle}</Text>
                </View>
              </View>
              );
            })}
          </ScrollView>
          
          {/* Indicator Dots */}
          <View style={styles.indicatorContainer}>
            {banners.map((_, index) => (
              <View
                key={`indicator-${index}`}
                style={[
                  styles.indicator,
                  activeSlide === index ? styles.indicatorActive : null,
                ]}
              />
            ))}
          </View>
        </View>
        ) : null}
        {/* Menu Categories - Scroll with Banner */}
        <View style={styles.menuContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'all' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'all' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍽️</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'all' && styles.menuLabelActive]}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'pizza' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('pizza')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'pizza' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍕</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'pizza' && styles.menuLabelActive]}>Pizza</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'burger' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('burger')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'burger' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍔</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'burger' && styles.menuLabelActive]}>Burger</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'phở' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('phở')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'phở' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍜</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'phở' && styles.menuLabelActive]}>Phở</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'cơm' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('cơm')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'cơm' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍱</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'cơm' && styles.menuLabelActive]}>Cơm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'bánh' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('bánh')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'bánh' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍰</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'bánh' && styles.menuLabelActive]}>Bánh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'Đồ uống' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('Đồ uống')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'Đồ uống' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>☕</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'Đồ uống' && styles.menuLabelActive]}>Đồ uống</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'gà' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('gà')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'gà' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🍗</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'gà' && styles.menuLabelActive]}>Gà rán</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, selectedCategory === 'salad' && styles.menuItemActive]}
              onPress={() => setSelectedCategory('salad')}
            >
              <View style={[styles.menuIcon, selectedCategory === 'salad' && styles.menuIconActive]}>
                <Text style={styles.menuEmoji}>🥗</Text>
              </View>
              <Text style={[styles.menuLabel, selectedCategory === 'salad' && styles.menuLabelActive]}>Salad</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filter Tabs - Sticky */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'nearby' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('nearby')}
            >
              <Text style={[styles.filterText, selectedFilter === 'nearby' && styles.filterTextActive]}>
                Gần tôi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'suggest' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('suggest')}
            >
              <Text style={[styles.filterText, selectedFilter === 'suggest' && styles.filterTextActive]}>
                Gợi ý hôm nay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'bestseller' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('bestseller')}
            >
              <Text style={[styles.filterText, selectedFilter === 'bestseller' && styles.filterTextActive]}>
                Bán chạy
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Restaurant List */}
        <View style={[
          { backgroundColor: '#fff', padding: containerPadding },
          isLandscape && numColumns > 1 && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
        ]}>
        {Array.isArray(filteredRestaurants) && filteredRestaurants.map((restaurant) => {
          if (!restaurant || typeof restaurant !== 'object') {
            return null;
          }
          
          try {
            const restaurantKey = coerceToString(
              restaurant._id ?? restaurant.id ?? restaurant.name,
              `key-${Date.now()}-${Math.random()}`
            );
            const imageCandidates = getRestaurantImageCandidates(restaurant);
            const fallbackIndex = restaurantImageFallbacks[restaurantKey] ?? 0;
            const displayImageUri = imageCandidates[fallbackIndex] || PLACEHOLDER_IMAGE;
            const normalizedRestaurant = {
              ...restaurant,
              image: imageCandidates[0] || restaurant.image,
            };
            
            const ratingNumber = coerceToNumber(restaurant.rating, 4.5);
            const ratingValue = ratingNumber.toFixed(1);
            
            const deliveryTimeValue = coerceToString(
              restaurant.estimatedDeliveryTime ?? restaurant.deliveryTime,
              '30-45 phút'
            );
            
            const distanceNumber = coerceToNumber(restaurant.distance, 2);
            const distanceValue = `${distanceNumber.toFixed(1)} km`;
            
            const percentageVoucher = Array.isArray(restaurant.vouchers)
              ? restaurant.vouchers.find((voucher: any) => voucher?.type === 'percentage')
              : null;
            const discountLabel = percentageVoucher && percentageVoucher.value
              ? `-${coerceToString(percentageVoucher.value)}%`
              : null;
            
            // Show matched products if searching
            const hasMatchedProducts = restaurant.matchedProducts && restaurant.matchedProducts.length > 0;
            const matchedProductNames = hasMatchedProducts 
              ? restaurant.matchedProducts.slice(0, 2).map((p: any) => p.name).join(', ')
              : '';

          return (
          <TouchableOpacity
            key={restaurantKey}
            style={[
              styles.restaurantCard,
              isLandscape && numColumns > 1 && { width: restaurantCardWidth, marginHorizontal: 0 }
            ]}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant: normalizedRestaurant })}
          >
            <Image
              source={{ uri: displayImageUri }}
              style={styles.restaurantImage}
              onError={() => {
                setRestaurantImageFallbacks((prev) => {
                  const currentIndex = prev[restaurantKey] ?? 0;
                  const nextIndex = Math.min(currentIndex + 1, imageCandidates.length - 1);
                  if (nextIndex === currentIndex) {
                    return prev;
                  }
                  return { ...prev, [restaurantKey]: nextIndex };
                });
              }}
            />
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {coerceToString(restaurant.name, 'Nhà hàng')}
                </Text>
                {discountLabel ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discountLabel}</Text>
                  </View>
                ) : null}
              </View>
              {hasMatchedProducts && (
                <Text style={styles.matchedProducts} numberOfLines={1}>
                  🍽️ {matchedProductNames}{restaurant.matchedProducts.length > 2 ? '...' : ''}
                </Text>
              )}
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.rating}>{ratingValue}</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.deliveryTime}>{deliveryTimeValue}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.distance}>{distanceValue}</Text>
              </View>
              <View style={styles.promoContainer}>
                <Text style={styles.promoIcon}>🚁</Text>
                <Text style={styles.promoText}>Drone - Siêu tốc</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
          } catch (renderError) {
            console.error('[HomeScreen] Failed to render restaurant:', renderError);
            return null;
          }
        })}
        <View style={{ height: 20 }} />
        </View>
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
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#888',
  },
  locationAddress: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  locationArrow: {
    fontSize: 16,
    color: '#EA5034',
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  searchResultsInfo: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4CC',
  },
  searchResultsText: {
    fontSize: 13,
    color: '#EA5034',
    fontWeight: '500',
  },
  carouselContainer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  carouselScroll: {
  },
  bannerSlide: {
    width: BANNER_WIDTH,
    aspectRatio: 16 / 9,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  indicatorActive: {
    backgroundColor: '#EA5034',
    width: 20,
    borderRadius: 3,
  },
  menuContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuScroll: {
    paddingHorizontal: 8,
  },
  menuScrollContent: {
    paddingHorizontal: 8,
  },
  menuItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  menuItemActive: {
    transform: [{ scale: 1.05 }],
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuIconActive: {
    backgroundColor: '#FFF0ED',
    borderColor: '#EA5034',
    borderWidth: 2,
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  menuLabelActive: {
    color: '#EA5034',
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScrollContent: {
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#EA5034',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  matchedProducts: {
    fontSize: 12,
    color: '#EA5034',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  discountBadge: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 2,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: '#d0d0d0',
    marginHorizontal: 6,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#888',
  },
  distance: {
    fontSize: 12,
    color: '#888',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  promoIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  promoText: {
    fontSize: 11,
    color: '#EA5034',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
