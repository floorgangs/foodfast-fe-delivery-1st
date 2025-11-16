import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { createOrder } from "../../services/orderService";
import "./PaymentGateway.css";

function PaymentGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { orderData, paymentMethod } = location.state || {};
  const user = useSelector((state) => state.auth.user);

  const [processing, setProcessing] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    if (!orderData) {
      navigate("/");
      return;
    }

    // Simulate payment processing
    const timer = setTimeout(() => {
      setProcessing(false);

      // Create order in localStorage
      const newOrder = createOrder({
        ...orderData,
        customerId: user?.id || "guest",
        customerName: user?.name || orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: user?.email || "",
        paymentMethod:
          paymentMethod === "vnpay"
            ? "VNPay"
            : paymentMethod === "momo"
            ? "MoMo"
            : "Tiền mặt",
      });

      setCreatedOrderId(newOrder.id);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            dispatch(clearCart());
            navigate(`/order-tracking/${newOrder.id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000); // 2 seconds processing

    return () => clearTimeout(timer);
  }, [orderData, navigate, dispatch, paymentMethod, user]);

  if (!orderData) return null;

  const getPaymentLogo = () => {
    switch (paymentMethod) {
      case "vnpay":
        return (
          <div className="payment-logo vnpay">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5f/VNPAY_logo.png"
              alt="VNPay"
              className="gateway-logo"
            />
          </div>
        );
      case "momo":
        return (
          <div className="payment-logo momo">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/62/MoMo_Logo.png"
              alt="MoMo"
              className="gateway-logo"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`payment-gateway ${
        paymentMethod === "vnpay"
          ? "vnpay-theme"
          : paymentMethod === "momo"
          ? "momo-theme"
          : ""
      }`}
    >
      <div className="payment-container">
        {processing ? (
          <div className="processing-state">
            {getPaymentLogo()}
            <div className="spinner" />
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng không tắt trình duyệt</p>
          </div>
        ) : (
          <div className="success-state">
            {getPaymentLogo()}
            <div className="success-icon">✓</div>
            <h2>Thanh toán thành công!</h2>
            <div className="order-info">
              <p className="order-id">
                Mã đơn hàng: <strong>{createdOrderId || orderData.id}</strong>
              </p>
              <p className="order-amount">
                Số tiền:{" "}
                <strong>{orderData.total.toLocaleString("vi-VN")} đ</strong>
              </p>
            </div>
            <p className="redirect-text">
              Chuyển hướng trong <strong>{countdown}</strong> giây...
            </p>
            <button
              onClick={() => {
                dispatch(clearCart());
                navigate("/order-tracking", {
                  state: { orderId: orderData.id },
                });
              }}
              className="continue-btn"
            >
              Xem đơn hàng ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentGateway;
