import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import axios from "axios";
import "./PaymentReturn.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function PaymentReturn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { provider } = useParams(); // 'vnpay' or 'momo'
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get payment method from URL param or path
        const paymentMethod =
          provider ||
          (window.location.pathname.includes("vnpay") ? "vnpay" : "momo");

        console.log(`🔍 Verifying ${paymentMethod} payment...`);

        // Call backend API to verify payment
        const response = await axios.get(
          `${API_URL}/payments/${paymentMethod}/return`,
          {
            params: Object.fromEntries(searchParams),
          }
        );

        console.log("✅ Payment response:", response.data);

        if (
          response.data.success &&
          response.data.data.paymentStatus === "success"
        ) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
          setOrderData(response.data.data.order);

          // Clear cart
          dispatch(clearCart());

          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate(`/order-tracking/${response.data.data.order._id}`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus("failed");
          setMessage(response.data.data.message || "Thanh toán thất bại!");
        }
      } catch (error) {
        console.error("❌ Payment return error:", error);
        setStatus("failed");
        setMessage(
          error.response?.data?.message || "Có lỗi xảy ra khi xử lý thanh toán"
        );
      }
    };

    handlePaymentReturn();
  }, [searchParams, provider, dispatch, navigate]);

  return (
    <div className="payment-return-page">
      <div className="container">
        <div className={`payment-result ${status}`}>
          {status === "processing" && (
            <div className="processing">
              <div className="spinner"></div>
              <h2>{message}</h2>
              <p>Vui lòng không tắt trình duyệt</p>
            </div>
          )}

          {status === "success" && (
            <div className="success">
              <div className="success-icon">✓</div>
              <h2>{message}</h2>
              <p>Đơn hàng của bạn đã được xác nhận</p>
              {orderData && (
                <div className="order-info">
                  <p>
                    <strong>Mã đơn hàng:</strong> {orderData.orderNumber}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    {orderData.total?.toLocaleString("vi-VN")}đ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> Đã thanh toán
                  </p>
                </div>
              )}
              <p className="countdown-text">
                Chuyển hướng trong <strong>{countdown}</strong> giây...
              </p>
              <div className="actions">
                <button
                  onClick={() => navigate(`/order-tracking/${orderData?._id}`)}
                  className="btn-primary"
                >
                  Xem đơn hàng ngay
                </button>
                <button onClick={() => navigate("/")} className="btn-secondary">
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="failed">
              <div className="failed-icon">✗</div>
              <h2>{message}</h2>
              <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác</p>
              <div className="actions">
                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary"
                >
                  Thử lại
                </button>
                <button onClick={() => navigate("/")} className="btn-secondary">
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

export default PaymentReturn;
