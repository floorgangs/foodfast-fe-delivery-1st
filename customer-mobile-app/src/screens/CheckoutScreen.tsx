import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';

const CheckoutScreen = ({ navigation }: any) => {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  // Mock addresses - In real app, get from Redux/API
  const [addresses] = useState([
    {
      id: '1',
      name: 'Nhà riêng',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '0901234567',
    },
    {
      id: '2',
      name: 'Văn phòng',
      address: '456 Đường DEF, Phường GHI, Quận 3, TP.HCM',
      phone: '0901234567',
    },
  ]);

  const [paymentMethods] = useState([
    { id: 'momo', name: 'MoMo', icon: '🅼' },
    { id: 'zalopay', name: 'ZaloPay', icon: '🇿' },
    { id: 'card', name: 'Thẻ tín dụng', icon: '💳' },
  ]);

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id || '');
  const [selectedPayment, setSelectedPayment] = useState('momo');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const deliveryFee = 15000; // Fixed drone delivery fee
  const finalTotal = total + deliveryFee - discount;

  const handleApplyVoucher = () => {
    // Mock voucher validation
    if (voucherCode.toUpperCase() === 'FREESHIP50') {
      setDiscount(15000);
      if (Platform.OS === 'web') {
        alert('Áp dụng voucher thành công!');
      } else {
        Alert.alert('Thành công', 'Áp dụng voucher thành công!');
      }
    } else if (voucherCode.toUpperCase() === 'SALE20') {
      setDiscount(total * 0.2);
      if (Platform.OS === 'web') {
        alert('Giảm 20% đơn hàng!');
      } else {
        Alert.alert('Thành công', 'Giảm 20% đơn hàng!');
      }
    } else {
      if (Platform.OS === 'web') {
        alert('Mã voucher không hợp lệ');
      } else {
        Alert.alert('Lỗi', 'Mã voucher không hợp lệ');
      }
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      if (Platform.OS === 'web') {
        alert('Vui lòng chọn địa chỉ giao hàng');
      } else {
        Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ giao hàng');
      }
      return;
    }

    if (!selectedPayment) {
      if (Platform.OS === 'web') {
        alert('Vui lòng chọn phương thức thanh toán');
      } else {
        Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      }
      return;
    }

    const selectedAddressData = addresses.find(a => a.id === selectedAddress);
    const selectedPaymentData = paymentMethods.find(p => p.id === selectedPayment);

    const order = {
      items: items.map((item, index) => ({
        id: `${item.id}-${Date.now()}-${index}`,
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      restaurantId: items[0].restaurantId,
      restaurantName: items[0].restaurantName,
      total: finalTotal,
    };

    dispatch(createOrder(order as any));
    dispatch(clearCart());
    navigation.navigate('OrderTracking');
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Address')}>
              <Text style={styles.changeButton}>Thay đổi</Text>
            </TouchableOpacity>
          </View>
          {addresses.length === 0 ? (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('Address')}
            >
              <Text style={styles.addAddressText}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          ) : (
            addresses.map(address => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddress === address.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddress(address.id)}
              >
                <View style={styles.radioButton}>
                  {selectedAddress === address.id && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>{address.address}</Text>
                  <Text style={styles.addressPhone}>{address.phone}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Đơn hàng</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{items[0]?.restaurantName}</Text>
          </View>
          {items.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemQuantity}>{`${item.quantity}x`}</Text>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemPrice}>
                {`${(item.price * item.quantity).toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
          ))}
        </View>

        {/* Voucher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎫 Mã giảm giá</Text>
          <View style={styles.voucherInput}>
            <TextInput
              style={styles.voucherTextInput}
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyVoucher}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
          {discount > 0 && (
            <Text style={styles.discountText}>
              {`✓ Giảm giá: -${discount.toLocaleString('vi-VN')}đ`}
            </Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          <Text style={styles.paymentNote}>
            * Chỉ hỗ trợ thanh toán online để đảm bảo giao hàng nhanh bằng drone
          </Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.radioButton}>
                {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Ghi chú</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú cho người bán..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            <Text style={styles.priceValue}>{`${total.toLocaleString('vi-VN')}đ`}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí giao hàng (Drone)</Text>
            <Text style={styles.priceValue}>{`${deliveryFee.toLocaleString('vi-VN')}đ`}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>{`-${discount.toLocaleString('vi-VN')}đ`}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{`${finalTotal.toLocaleString('vi-VN')}đ`}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerTotalValue}>{`${finalTotal.toLocaleString('vi-VN')}đ`}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder}>
          <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  changeButton: {
    color: '#EA5034',
    fontSize: 14,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#EA5034',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#EA5034',
    fontSize: 14,
    fontWeight: '500',
  },
  addressCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressCardSelected: {
    borderColor: '#EA5034',
    backgroundColor: '#FFF5F3',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EA5034',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA5034',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#999',
  },
  restaurantInfo: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemQuantity: {
    width: 40,
    fontSize: 14,
    color: '#666',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  voucherInput: {
    flexDirection: 'row',
  },
  voucherTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#EA5034',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  discountText: {
    color: '#27AE60',
    fontSize: 14,
    marginTop: 8,
  },
  paymentNote: {
    fontSize: 12,
    color: '#EA5034',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentCardSelected: {
    borderColor: '#EA5034',
    backgroundColor: '#FFF5F3',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  discountValue: {
    fontSize: 14,
    color: '#27AE60',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA5034',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA5034',
  },
  checkoutButton: {
    backgroundColor: '#EA5034',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#999',
  },
});

export default CheckoutScreen;
