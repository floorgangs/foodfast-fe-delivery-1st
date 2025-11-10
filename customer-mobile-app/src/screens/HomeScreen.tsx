import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { mockRestaurants } from '../data/mockData';

const HomeScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState('');

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🚁 FoodFast</Text>
          <TouchableOpacity style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Giao đến: Quận 1, TP.HCM</Text>
            <Text style={styles.locationArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm món ăn, nhà hàng..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Banner Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.bannerContainer}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🚁 Giao hàng bằng Drone - Siêu tốc trong 15 phút!</Text>
        </View>
        <View style={[styles.banner, { backgroundColor: '#FFE5E0' }]}>
          <Text style={styles.bannerText}>🎁 Giảm 50K cho đơn đầu tiên</Text>
        </View>
        <View style={[styles.banner, { backgroundColor: '#E0F2FF' }]}>
          <Text style={styles.bannerText}>⚡ Miễn phí giao hàng mọi đơn</Text>
        </View>
      </ScrollView>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nhà hàng gần bạn</Text>
        <Text style={styles.seeAll}>Tất cả nhà hàng</Text>
      </View>

      {/* Restaurant List */}
      <View style={styles.restaurantList}>
        {filteredRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
          >
            <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
            {/* Discount Badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Giảm 20%</Text>
            </View>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.rating}>{restaurant.rating}</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.promoContainer}>
                <Text style={styles.promoIcon}>🚁</Text>
                <Text style={styles.promoText}>Giao bằng Drone - Siêu tốc</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA5034',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  locationArrow: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  profileIcon: {
    fontSize: 24,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  bannerContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  banner: {
    width: 350,
    height: 80,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginLeft: 12,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  categoriesGrid: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItem: {
    width: 70,
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 13,
    color: '#EA5034',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonActive: {
    backgroundColor: '#EA5034',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  restaurantList: {
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA5034',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
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
    fontSize: 11,
    marginRight: 2,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 5,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  promoIcon: {
    fontSize: 11,
    marginRight: 3,
  },
  promoText: {
    fontSize: 10,
    color: '#EA5034',
    fontWeight: '600',
  },
});

export default HomeScreen;
