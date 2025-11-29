import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Debug logging and validation
  useEffect(() => {
    console.log('[ThirdPartyPayment] Screen params:', {
      orderId,
      orderNumber,
      amount,
      sessionId,
      paymentMethod,
      restaurantName,
    });
    
    // Validate required parameters
    if (!orderId || !sessionId) {
      console.error('[ThirdPartyPayment] Missing required params:', { orderId, sessionId });
      const errorMsg = 'Thông tin thanh toán không đầy đủ. Vui lòng thử lại.';
      setError(errorMsg);
      Alert.alert(
        'Lỗi thanh toán',
        errorMsg,
        [
          {
            text: 'Quay lại',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [orderId, sessionId, orderNumber, amount, paymentMethod, restaurantName, navigation]);

  const formattedAmount = useMemo(() => {
    return `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
  }, [amount]);

  const expiresText = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  const getPaymentConfig = () => {
    // Only PayPal is supported
    return {
      name: 'PayPal',
      color: '#003087',
      bgColor: '#E5F2FF',
      logo: '🅿',
      buttonColor: '#0070BA',
    };
  };

  const config = getPaymentConfig();

  const handlePayment = async (status: 'success' | 'failed') => {
    if (processing) {
      console.log('[ThirdPartyPayment] Already processing, ignoring click');
      return;
    }

    // Validate before processing
    if (!orderId || !sessionId) {
      console.error('[ThirdPartyPayment] Cannot process payment - missing orderId or sessionId');
      setError('Thông tin thanh toán không hợp lệ');
      return;
    }

    console.log('[ThirdPartyPayment] Processing payment:', { orderId, sessionId, status });
    setProcessing(status);
    setError('');
    
    try {
      console.log('[ThirdPartyPayment] Calling confirmThirdParty API...');
      const response = await paymentAPI.confirmThirdParty({ orderId, sessionId, status });
      console.log('[ThirdPartyPayment] API response:', response);
      
      if (status === 'success') {
        console.log('[ThirdPartyPayment] Payment success - clearing cart and navigating');
        try {
          await dispatch(clearCart());
        } catch (cartError) {
          console.warn('[ThirdPartyPayment] Failed to clear cart:', cartError);
        }
        // Navigate to Home tab first, then to Orders tab
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        setTimeout(() => {
          navigation.navigate('Orders');
        }, 100);
      } else {
        console.log('[ThirdPartyPayment] Payment cancelled - going back');
        // Don't clear cart on cancel - user can try again
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('[ThirdPartyPayment] Payment confirmation error:', err);
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

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

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
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
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
