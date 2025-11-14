import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';

const { width } = Dimensions.get('window');

const DEBUG_IMAGES = true; // set to false to hide debug URIs

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { product, restaurant } = route.params as { product: any; restaurant: any };
  const images = product.images ?? [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImageIndexes, setFailedImageIndexes] = useState<Record<number, boolean>>({});
  const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l8GAAAAHUlEQVR4nGNgGAWjYBSMglEwCkbGhoYGBgYGBgAAMaQF4nKp8OAAAAAElFTkSuQmCC';
  const scrollRef = useRef<ScrollView | null>(null);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const price = product.price ?? 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // nếu chưa đăng nhập, chuyển tới màn hình Login và truyền item đang chờ
      navigation.navigate('Login', { pendingAdd: { product, restaurant } });
      return;
    }

    // Thêm 1 món vào giỏ (số lượng mặc định 1)
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      image: images[0],
    }));
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
    navigation.goBack();
  };

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
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
            const failed = failedImageIndexes[idx];
            if (failed) {
              // try restaurant image as fallback if different
              if (restaurant.image && restaurant.image !== uri) {
                return (
                  <Image
                    key={idx}
                    source={{ uri: restaurant.image }}
                    style={styles.heroImage}
                    resizeMode="cover"
                    onError={() => setFailedImageIndexes(prev => ({ ...prev, [idx]: true }))}
                  />
                );
              }
              return (
                <Image key={idx} source={{ uri: PLACEHOLDER_IMAGE }} style={styles.heroImage} resizeMode="cover" />
              );
            }

              return (
                <React.Fragment key={idx}>
                  <Image
                    source={{ uri }}
                    style={styles.heroImage}
                    resizeMode="cover"
                    onError={() => {
                      console.error('Hero onError for index', idx, 'uri', uri);
                      setFailedImageIndexes(prev => ({ ...prev, [idx]: true }));
                    }}
                    onLoadEnd={() => console.log('Hero onLoadEnd index', idx, 'uri', uri)}
                  />
                  {DEBUG_IMAGES && (
                    <Text style={{ fontSize: 10, color: '#888', paddingHorizontal: 8, marginTop: 6 }} numberOfLines={1} ellipsizeMode="middle">{uri}</Text>
                  )}
                </React.Fragment>
              );
          })}
        </ScrollView>

        <View style={styles.imageDots}>
          {images.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={[styles.row, { marginTop: 12 }]}> 
            <View>
              <Text style={styles.price}>{price.toLocaleString('vi-VN')}đ</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                {/* Rating and reviews count */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const iconName = (product.rating ?? 0) >= i + 1 ? 'star' : (product.rating ?? 0) >= i + 0.5 ? 'star-half' : 'star-outline';
                    return (
                      <Ionicons key={i} name={iconName as any} size={14} color="#FFB800" style={{ marginRight: 4 }} />
                    );
                  })}
                  <Text style={{ marginLeft: 6, fontWeight: '600' }}>{(product.rating ?? 0).toFixed(1)}</Text>
                  <Text style={{ marginLeft: 6, color: '#777' }}>({(product.reviewCount ?? 0).toLocaleString('vi-VN')})</Text>
                </View>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#777', fontSize: 12 }}>Lượt bán</Text>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>{(product.sold ?? product.sales ?? 0).toLocaleString('vi-VN')}</Text>
            </View>
          </View>

          {/* Reviews / Comments section */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Đánh giá và bình luận</Text>
            {(product.comments ?? [
              { id: 'c1', user: 'Lan', rating: 5, text: 'Ngon, giao nhanh!', date: '2025-11-01' },
              { id: 'c2', user: 'Minh', rating: 4, text: 'Hơi mặn nhưng ổn', date: '2025-10-28' },
            ]).map((c: any) => (
              <View key={c.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ fontWeight: '700' }}>{(c.user || 'U').charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={{ fontWeight: '700' }}>{c.user}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < Math.round(c.rating) ? 'star' : 'star-outline'} size={12} color="#FFB800" />
                        ))}
                        <Text style={{ marginLeft: 6, color: '#777', fontSize: 12 }}>{c.date}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={{ marginTop: 8, color: '#444' }}>{c.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingBar}>
        <View>
          <Text style={styles.totalLabel}>Tổng</Text>
          <Text style={styles.totalPrice}>{price.toLocaleString('vi-VN')}đ</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
          <Ionicons name="cart" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  back: { padding: 6 },
  backText: { fontSize: 20, color: '#333' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  content: { flex: 1 },
  heroImage: { width, height: width * 0.6, resizeMode: 'cover' },
  imageDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#ddd', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#EA5034' },
  card: { padding: 16, backgroundColor: '#fff', marginTop: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  description: { color: '#666', marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { fontSize: 18, fontWeight: '800', color: '#EA5034' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 8 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { fontSize: 18, color: '#333' },
  qtyText: { minWidth: 28, textAlign: 'center', fontWeight: '700' },
  optionLabel: { fontWeight: '600', color: '#333', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' as any, gap: 8 },
  optionPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginRight: 8, marginBottom: 8 },
  optionPillActive: { backgroundColor: '#EA5034', borderColor: '#EA5034' },
  optionText: { color: '#333' },
  optionTextActive: { color: '#fff' },
  noteTitle: { fontWeight: '700' },
  noteText: { color: '#666', marginTop: 6 },
  floatingBar: { position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 } },
  totalLabel: { color: '#999', fontSize: 12 },
  totalPrice: { fontWeight: '700', fontSize: 16 },
  addBtn: { backgroundColor: '#EA5034', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
});
