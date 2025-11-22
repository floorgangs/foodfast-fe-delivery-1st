import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import type { AppDispatch } from '../store';
import { paymentAPI } from '../services/api';

const ThirdPartyPaymentScreen = ({ route, navigation }: any) => {
  const {
    orderId,
    orderNumber,
    amount,
    sessionId,
    providerName,
    paymentMethod,
    restaurantName,
    expiresAt,
  } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();
  const [processing, setProcessing] = useState<'success' | 'failed' | null>(null);
  const [error, setError] = useState('');

  const formattedAmount = useMemo(() => {
    return `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
  }, [amount]);

  const expiresText = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  const getPaymentConfig = () => {
    switch (paymentMethod) {
      case 'momo':
        return {
          name: 'MoMo',
          color: '#A50064',
          bgColor: '#FFF0F8',
          logo: '🅼',
          buttonColor: '#A50064',
        };
      case 'vnpay':
        return {
          name: 'VNPay',
          color: '#0066B3',
          bgColor: '#E5F1FA',
          logo: 'Ⓥ',
          buttonColor: '#0066B3',
        };
      default:
        return {
          name: 'MoMo',
          color: '#A50064',
          bgColor: '#FFF0F8',
          logo: '🅼',
          buttonColor: '#A50064',
        };
    }
  };

  const config = getPaymentConfig();

  const handlePayment = async (status: 'success' | 'failed') => {
    if (processing) {
      return;
    }
    setProcessing(status);
    setError('');
    try {
      await paymentAPI.confirmThirdParty({ orderId, sessionId, status });
      if (status === 'success') {
        dispatch(clearCart());
        // Navigate to Home tab first, then to Orders tab
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        setTimeout(() => {
          navigation.navigate('Orders');
        }, 100);
      } else {
        // Don't clear cart on cancel - user can try again
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xác nhận thanh toán');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: config.bgColor }]}>
      <View style={[styles.container, { backgroundColor: config.bgColor }]}>
        {/* Header with logo */}
        <View style={[styles.header, { backgroundColor: config.color }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{config.logo}</Text>
          </View>
          <Text style={styles.headerTitle}>{config.name}</Text>
          <Text style={styles.headerSubtitle}>Cổng thanh toán điện tử</Text>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin thanh toán</Text>
            <Text style={styles.orderTag}>#{orderNumber}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nhà hàng</Text>
            <Text style={styles.infoValue}>{restaurantName || 'FoodFast Partner'}</Text>
          </View>
          
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
            <Text style={[styles.amount, { color: config.color }]}>{formattedAmount}</Text>
          </View>
          
          {expiresText && (
            <View style={styles.expiryNotice}>
              <Text style={styles.expiryText}>⏰ Phiên thanh toán hết hạn lúc {expiresText}</Text>
            </View>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: config.buttonColor }, processing === 'success' && styles.disabledButton]}
          disabled={processing !== null}
          onPress={() => handlePayment('success')}
        >
          {processing === 'success' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>✓ Xác nhận thanh toán</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, processing === 'failed' && styles.disabledButton]}
          disabled={processing !== null}
          onPress={() => handlePayment('failed')}
        >
          {processing === 'failed' ? (
            <ActivityIndicator color="#666" />
          ) : (
            <Text style={styles.cancelButtonText}>✕ Hủy giao dịch</Text>
          )}
        </TouchableOpacity>

        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>🔒 Giao dịch được mã hóa và bảo mật</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderTag: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amountSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  expiryNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  expiryText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    marginHorizontal: 16,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  payButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  securityBadge: {
    marginTop: 20,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ThirdPartyPaymentScreen;
