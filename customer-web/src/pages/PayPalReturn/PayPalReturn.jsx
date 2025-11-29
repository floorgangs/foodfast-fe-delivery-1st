import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { paypalAPI, paymentAPI, cartAPI } from '../../services/api';
import './PayPalReturn.css';

function PayPalReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const token = searchParams.get('token');
  const payerId = searchParams.get('PayerID');
  const orderId = searchParams.get('orderId') || localStorage.getItem('foodfast_order_id');
  
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    handlePayPalReturn();
  }, []);

  const handlePayPalReturn = async () => {
    try {
      if (!token) {
        setStatus('failed');
        setMessage('Không tìm thấy thông tin thanh toán');
        return;
      }

      console.log('[PayPal Return] Processing with token:', token, 'orderId:', orderId);

      // Capture the PayPal order
      const captureResponse = await paypalAPI.captureOrder({
        paypalOrderId: token,
        orderId: orderId,
      });

      console.log('[PayPal Return] Capture response:', captureResponse);

      if (captureResponse?.success && captureResponse?.data?.status === 'COMPLETED') {
        // Confirm payment with backend
        await paymentAPI.confirmThirdParty({
          orderId: orderId,
          sessionId: token,
          status: 'success',
        });

        // Clear cart - call API directly to ensure it clears
        console.log('[PayPal Return] Clearing cart...');
        try {
          await cartAPI.clear();
          console.log('[PayPal Return] Cart cleared on server');
        } catch (clearErr) {
          console.warn('[PayPal Return] Failed to clear cart on server:', clearErr);
        }
        dispatch(clearCart());

        // Clean up localStorage
        localStorage.removeItem('paypal_order_id');
        localStorage.removeItem('foodfast_order_id');
        localStorage.removeItem('paypal_amount');

        setStatus('success');
        setMessage('Thanh toán thành công!');

        // Start countdown and redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate(`/order-tracking/${orderId}`, { 
                replace: true,
                state: { paymentSuccess: true }
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error('Payment capture failed');
      }
    } catch (error) {
      console.error('[PayPal Return] Error:', error);
      setStatus('failed');
      setMessage(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    }
  };

  return (
    <div className="paypal-return-page">
      <div className="container">
        <div className={`payment-result ${status}`}>
          {status === 'processing' && (
            <div className="processing">
              <div className="spinner"></div>
              <h2>{message}</h2>
              <p>Vui lòng không tắt trình duyệt</p>
            </div>
          )}

          {status === 'success' && (
            <div className="success">
              <div className="success-icon">✓</div>
              <h2>{message}</h2>
              <p>Đơn hàng của bạn đã được xác nhận và thanh toán thành công</p>
              <p className="countdown-text">
                Chuyển hướng trong <strong>{countdown}</strong> giây...
              </p>
              <div className="actions">
                <button
                  onClick={() => navigate(`/order-tracking/${orderId}`, { replace: true })}
                  className="btn-primary"
                >
                  Xem đơn hàng ngay
                </button>
                <button onClick={() => navigate('/')} className="btn-secondary">
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="failed">
              <div className="failed-icon">✗</div>
              <h2>Thanh toán thất bại</h2>
              <p>{message}</p>
              <div className="actions">
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-primary"
                >
                  Thử lại
                </button>
                <button onClick={() => navigate('/')} className="btn-secondary">
                  Về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayPalReturn;
