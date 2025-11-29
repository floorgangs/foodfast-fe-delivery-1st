import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { paypalAPI, paymentAPI } from '../services/api';
import type { AppDispatch } from '../store';

interface PayPalPaymentScreenProps {
  route: any;
  navigation: any;
}

const PayPalPaymentScreen: React.FC<PayPalPaymentScreenProps> = ({
  route,
  navigation,
}) => {
  const { orderId, amount, description } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paypalUrl, setPaypalUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    initPayPalPayment();
  }, []);

  const initPayPalPayment = async () => {
    try {
      setLoading(true);

      // Chuyển đổi VND sang USD (tỷ giá ước lượng: 1 USD = 25,000 VND)
      const amountUSD = (amount / 25000).toFixed(2);

      console.log('[PayPal] Creating order:', {
        orderId,
        amountVND: amount,
        amountUSD,
        description,
      });

      const response = await paypalAPI.createOrder({
        amount: parseFloat(amountUSD),
        orderId: orderId,
        description: description || `FoodFast Order #${orderId}`,
      });

      if (response?.success && response?.data?.approvalUrl) {
        setPaypalUrl(response.data.approvalUrl);
        setPaypalOrderId(response.data.id);
        console.log('[PayPal] Order created:', response.data);
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error: any) {
      console.error('[PayPal] Init error:', error);
      Alert.alert(
        'Lỗi khởi tạo thanh toán',
        error.message || 'Không thể kết nối với PayPal',
        [
          {
            text: 'Quay lại',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    console.log('[PayPal] Navigation to:', url);

    // Kiểm tra return URL (thanh toán thành công)
    if (url.includes('/payment/paypal-return')) {
      console.log('[PayPal] Payment return detected');
      await handlePaymentSuccess();
    }

    // Kiểm tra cancel URL (hủy thanh toán)
    if (url.includes('/payment/paypal-cancel')) {
      console.log('[PayPal] Payment cancelled');
      handlePaymentCancel();
    }
  };

  const handlePaymentSuccess = async () => {
    if (processing || !paypalOrderId) {
      return;
    }

    try {
      setProcessing(true);

      console.log('[PayPal] Capturing order:', paypalOrderId);

      // Capture PayPal order
      const captureResponse = await paypalAPI.captureOrder({
        paypalOrderId: paypalOrderId,
        orderId: orderId,
      });

      console.log('[PayPal] Capture response:', captureResponse);

      if (captureResponse?.success && captureResponse?.data?.status === 'COMPLETED') {
        // Xác nhận thanh toán với backend
        await paymentAPI.confirmThirdParty({
          orderId: orderId,
          sessionId: paypalOrderId,
          status: 'success',
        });

        // Xóa giỏ hàng
        await dispatch(clearCart());

        Alert.alert(
          'Thanh toán thành công!',
          'Đơn hàng của bạn đã được xác nhận.',
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'MainTabs' },
                    {
                      name: 'OrderTracking',
                      params: { orderId: orderId },
                    },
                  ],
                });
              },
            },
          ]
        );
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error: any) {
      console.error('[PayPal] Success handler error:', error);
      Alert.alert(
        'Lỗi xác nhận thanh toán',
        'Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn đã hủy thanh toán. Đơn hàng sẽ bị hủy.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy thanh toán?',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Có',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán PayPal</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0070BA" />
          <Text style={styles.loadingText}>Đang kết nối PayPal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!paypalUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán PayPal</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EA5034" />
          <Text style={styles.errorText}>Không thể tải trang thanh toán</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initPayPalPayment}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán PayPal</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: paypalUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color="#0070BA" />
          </View>
        )}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />

      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color="#0070BA" />
            <Text style={styles.processingText}>Đang xử lý thanh toán...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0070BA',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});

export default PayPalPaymentScreen;
