import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { paypalAPI } from '../../services/api';
import './PayPalPayment.css';

function PayPalPayment() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amount = parseInt(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || `FoodFast Order #${orderId}`;

  const [loading, setLoading] = useState(true);
  const [paypalUrl, setPaypalUrl] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initPayPalPayment();
  }, []);

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

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn hủy thanh toán?')) {
      navigate(-1);
    }
  };

  // Redirect trực tiếp đến PayPal
  const handleOpenPayPal = () => {
    if (paypalUrl) {
      // Store state before redirecting
      localStorage.setItem('paypal_order_id', paypalOrderId);
      localStorage.setItem('foodfast_order_id', orderId);
      localStorage.setItem('paypal_amount', amount.toString());
      
      // Redirect trực tiếp đến PayPal
      window.location.href = paypalUrl;
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
        </div>
      </div>
    </div>
  );
}

export default PayPalPayment;
