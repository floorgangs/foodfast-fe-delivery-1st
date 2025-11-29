import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { paypalAPI, paymentAPI } from '../../services/api';
import './PayPalPayment.css';

function PayPalPayment() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const amount = parseInt(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || `FoodFast Order #${orderId}`;

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paypalUrl, setPaypalUrl] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    initPayPalPayment();
  }, []);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      // Check if message is from PayPal
      if (event.data?.type === 'paypal_return' || 
          (typeof event.data === 'string' && event.data.includes('paypal-return'))) {
        await handlePaymentSuccess();
      }
      if (event.data?.type === 'paypal_cancel' ||
          (typeof event.data === 'string' && event.data.includes('paypal-cancel'))) {
        handlePaymentCancel();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paypalOrderId]);

  const initPayPalPayment = async () => {
    try {
      setLoading(true);
      setError(null);

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
        description: description,
      });

      if (response?.success && response?.data?.approvalUrl) {
        setPaypalUrl(response.data.approvalUrl);
        setPaypalOrderId(response.data.id);
        console.log('[PayPal] Order created:', response.data);
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (err) {
      console.error('[PayPal] Init error:', err);
      setError(err.message || 'Không thể kết nối với PayPal');
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Try to get iframe URL (may fail due to CORS)
      try {
        const iframeUrl = iframe.contentWindow?.location?.href;
        if (iframeUrl) {
          console.log('[PayPal] Iframe URL:', iframeUrl);
          
          if (iframeUrl.includes('paypal-return') || iframeUrl.includes('token=')) {
            handlePaymentSuccess();
          } else if (iframeUrl.includes('paypal-cancel')) {
            handlePaymentCancel();
          }
        }
      } catch (e) {
        // CORS error - expected for cross-origin iframes
      }
    } catch (err) {
      console.warn('[PayPal] Iframe load handler error:', err);
    }
  };

  const handlePaymentSuccess = async () => {
    if (processingRef.current || !paypalOrderId) {
      return;
    }

    try {
      processingRef.current = true;
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

        // Navigate to order tracking
        navigate(`/order-tracking/${orderId}`, { 
          replace: true,
          state: { paymentSuccess: true }
        });
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err) {
      console.error('[PayPal] Success handler error:', err);
      setError('Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
      setProcessing(false);
      processingRef.current = false;
    }
  };

  const handlePaymentCancel = () => {
    if (window.confirm('Bạn đã hủy thanh toán. Đơn hàng sẽ bị hủy. Quay về trang chủ?')) {
      navigate('/');
    }
  };

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn hủy thanh toán?')) {
      navigate(-1);
    }
  };

  // Open PayPal in new window instead of iframe (better UX)
  const handleOpenPayPal = () => {
    if (paypalUrl) {
      // Store state before opening
      sessionStorage.setItem('paypal_order_id', paypalOrderId);
      sessionStorage.setItem('foodfast_order_id', orderId);
      
      // Open PayPal in popup
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      const popup = window.open(
        paypalUrl,
        'PayPal',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      // Poll for popup close
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          // Check if payment was completed
          const completed = sessionStorage.getItem('paypal_completed');
          if (completed === 'true') {
            sessionStorage.removeItem('paypal_completed');
            handlePaymentSuccess();
          }
        }
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="paypal-payment-page">
        <div className="paypal-container">
          <div className="paypal-header">
            <button className="close-btn" onClick={handleClose}>✕</button>
            <h1>Thanh toán PayPal</h1>
          </div>
          <div className="paypal-loading">
            <div className="spinner"></div>
            <p>Đang kết nối PayPal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paypal-payment-page">
        <div className="paypal-container">
          <div className="paypal-header">
            <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
            <h1>Thanh toán PayPal</h1>
          </div>
          <div className="paypal-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="retry-btn" onClick={initPayPalPayment}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-payment-page">
      <div className="paypal-container">
        <div className="paypal-header">
          <button className="close-btn" onClick={handleClose}>✕</button>
          <h1>Thanh toán PayPal</h1>
        </div>

        <div className="paypal-content">
          <div className="payment-info">
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <strong>#{orderId?.slice(-8)}</strong>
            </div>
            <div className="info-row">
              <span>Số tiền:</span>
              <strong>{amount.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="info-row">
              <span>Quy đổi (USD):</span>
              <strong>${(amount / 25000).toFixed(2)}</strong>
            </div>
          </div>

          <div className="paypal-actions">
            <button 
              className="paypal-btn"
              onClick={handleOpenPayPal}
              disabled={!paypalUrl}
            >
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                alt="PayPal"
              />
              Thanh toán với PayPal
            </button>
            
            <p className="paypal-note">
              Bạn sẽ được chuyển đến trang PayPal để hoàn tất thanh toán an toàn.
            </p>
          </div>

          {/* Alternative: Embedded iframe (may have CORS issues) */}
          {paypalUrl && (
            <div className="paypal-iframe-container">
              <iframe
                ref={iframeRef}
                src={paypalUrl}
                title="PayPal Payment"
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              />
            </div>
          )}
        </div>

        {processing && (
          <div className="processing-overlay">
            <div className="processing-box">
              <div className="spinner"></div>
              <p>Đang xử lý thanh toán...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PayPalPayment;
