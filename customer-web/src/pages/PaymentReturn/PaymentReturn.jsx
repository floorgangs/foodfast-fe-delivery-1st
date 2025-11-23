import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./PaymentReturn.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function PaymentReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get payment method from path
        const paymentMethod = window.location.pathname.includes("vnpay")
          ? "vnpay"
          : "momo";

        // Call backend API to verify payment
        const response = await axios.get(
          `${API_URL}/payments/${paymentMethod}/return`,
          {
            params: Object.fromEntries(searchParams),
          }
        );

        if (
          response.data.success &&
          response.data.data.paymentStatus === "success"
        ) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
          setOrderData(response.data.data.order);
        } else {
          setStatus("failed");
          setMessage(response.data.data.message || "Thanh toán thất bại!");
        }
      } catch (error) {
        console.error("Payment return error:", error);
        setStatus("failed");
        setMessage(
          error.response?.data?.message || "Có lỗi xảy ra khi xử lý thanh toán"
        );
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

  return (
    <div className="payment-return-page">
      <div className="container">
        <div className={`payment-result ${status}`}>
          {status === "processing" && (
            <div className="processing">
              <div className="spinner"></div>
              <h2>{message}</h2>
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
                    {orderData.total?.toLocaleString()}đ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> Đã xác nhận
                  </p>
                </div>
              )}
              <div className="actions">
                <button
                  onClick={() => navigate("/orders")}
                  className="btn-primary"
                >
                  Xem đơn hàng
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
