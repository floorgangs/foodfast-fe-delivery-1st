import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { mockRestaurants } from '../data/mockData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32; // 16px padding on each side

const banners = [
  { 
    id: 1, 
    title: 'GIAO DRONE - SIÊU TỐC', 
    subtitle: 'Chỉ 15 phút có ngay',
    image: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800&q=80',
  },
  { 
    id: 2, 
    title: 'GIẢM 50K', 
    subtitle: 'Cho đơn hàng đầu tiên',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  },
  { 
    id: 3, 
    title: 'MIỄN PHÍ SHIP', 
    subtitle: 'Áp dụng cho mọi đơn hàng',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  },
  { 
    id: 4, 
    title: 'FLASH SALE', 
    subtitle: 'Giảm đến 30% hôm nay',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  },
  { 
    id: 5, 
    title: 'VOUCHER 100K', 
    subtitle: 'Dành cho thành viên mới',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
  },
  { 
    id: 6, 
    title: 'TÍCH ĐIỂM ĐỔI QUÀ', 
    subtitle: 'Nhiều phần quà hấp dẫn',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  },
];

const HomeScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('suggest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter and sort restaurants based on selected filter and category
  const getFilteredRestaurants = () => {
    let restaurants = mockRestaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                              restaurant.category === selectedCategory ||
                              restaurant.name.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });

    // Sort based on selected filter
    if (selectedFilter === 'nearby') {
      // Sort by distance (closest first)
      restaurants = [...restaurants].sort((a, b) => a.distance - b.distance);
    } else if (selectedFilter === 'bestseller') {
      // Sort by number of orders (most popular first)
      restaurants = [...restaurants].sort((a, b) => b.orders - a.orders);
    } else {
      // 'suggest' - sort by rating (highest first)
      restaurants = [...restaurants].sort((a, b) => b.rating - a.rating);
    }

    return restaurants;
  };

  const filteredRestaurants = getFilteredRestaurants();

  // Auto scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % banners.length;
      setActiveSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * (BANNER_WIDTH + 16), // +16 for marginRight
        animated: true,
      });
    }, 3000); // Auto scroll every 3 seconds

    return () => clearInterval(interval);
  }, [activeSlide]);

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
        <View style={[
          styles.searchContainer, 
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { outline: 'none' } as any]}
            placeholder="Tìm món ăn, nhà hàng..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            underlineColorAndroid="transparent"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content with Banner, Menu, Filter Tabs and Restaurant List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        stickyHeaderIndices={[2]}
      >
        {/* Banner Carousel with Auto Scroll */}
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
            {banners.map((banner) => (
              <View key={banner.id} style={styles.bannerSlide}>
                <Image 
                  source={{ uri: banner.image }} 
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Indicator Dots */}
          <View style={styles.indicatorContainer}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  activeSlide === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

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
        <View style={{ backgroundColor: '#fff' }}>
        {filteredRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
          >
            <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeader}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-20%</Text>
                </View>
              </View>
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.rating}>{restaurant.rating}</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.deliveryTime}>
                  {restaurant.deliveryTime}
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.distance}>{restaurant.distance}km</Text>
              </View>
              <View style={styles.promoContainer}>
                <Text style={styles.promoIcon}>🚁</Text>
                <Text style={styles.promoText}>
                  Drone - Siêu tốc
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
        </View>
      </ScrollView>
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
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: '#fff',
    borderColor: '#EA5034',
    shadowColor: '#EA5034',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
});

export default HomeScreen;
