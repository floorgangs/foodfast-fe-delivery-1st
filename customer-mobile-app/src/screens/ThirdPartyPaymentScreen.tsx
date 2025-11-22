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
        navigation.replace('Orders');
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xác nhận thanh toán');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.providerLabel}>Thanh toán qua</Text>
        <Text style={styles.providerName}>{providerName || 'DronePay Gateway'}</Text>

        <View style={styles.card}>
          <Text style={styles.orderTag}>Đơn #{orderNumber}</Text>
          <Text style={styles.amountLabel}>Số tiền phải thanh toán</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
          <Text style={styles.restaurant}>Nhà hàng: {restaurantName || 'FoodFast Partner'}</Text>
          {expiresText ? (
            <Text style={styles.expireLabel}>Phiên thanh toán hết hạn lúc {expiresText}</Text>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.payButton, processing === 'success' && styles.disabledButton]}
          disabled={processing !== null}
          onPress={() => handlePayment('success')}
        >
          {processing === 'success' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Thanh toán &amp; xác nhận</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, processing === 'failed' && styles.disabledButton]}
          disabled={processing !== null}
          onPress={() => handlePayment('failed')}
        >
          {processing === 'failed' ? (
            <ActivityIndicator color="#EA5034" />
          ) : (
            <Text style={styles.cancelButtonText}>Hủy &amp; quay lại</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Bạn đang thao tác trên cổng thanh toán độc lập. Sau khi xác nhận thành công, drone sẽ được điều
          động tự động.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0F172A',
  },
  providerLabel: {
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  providerName: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
  },
  card: {
    marginTop: 28,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  orderTag: {
    color: '#94A3B8',
    fontSize: 13,
  },
  amountLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    marginTop: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 4,
  },
  restaurant: {
    color: '#CBD5F5',
    fontSize: 14,
    marginTop: 16,
  },
  expireLabel: {
    color: '#FACC15',
    marginTop: 12,
    fontSize: 13,
  },
  errorText: {
    color: '#F87171',
    marginTop: 16,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EA5034',
  },
  cancelButtonText: {
    color: '#EA5034',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  disclaimer: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});

export default ThirdPartyPaymentScreen;
