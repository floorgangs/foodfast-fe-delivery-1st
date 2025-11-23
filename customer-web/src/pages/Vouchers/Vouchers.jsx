import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { voucherAPI } from "../../services/api";
import "./Vouchers.css";

function Vouchers() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchVouchers();
  }, [isAuthenticated, navigate]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getAll();
      const data = response?.data ?? response;
      setVouchers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Đã sao chép mã voucher!");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const isVoucherExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const isVoucherActive = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.expiryDate);
    return voucher.isActive && now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="vouchers-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải voucher...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeVouchers = vouchers.filter(isVoucherActive);
  const expiredVouchers = vouchers.filter((v) => !isVoucherActive(v));

  return (
    <div className="vouchers-page">
      <div className="container">
        <div className="vouchers-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Quay lại
          </button>
          <h1>Voucher của bạn</h1>
        </div>

        {activeVouchers.length === 0 && expiredVouchers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <p>Chưa có voucher</p>
          </div>
        ) : (
          <>
            {activeVouchers.length > 0 && (
              <div className="vouchers-section">
                <h2>Voucher khả dụng</h2>
                <div className="vouchers-list">
                  {activeVouchers.map((voucher) => (
                    <div key={voucher._id} className="voucher-card active">
                      <div className="voucher-left">
                        <div className="voucher-icon">🎁</div>
                        <div className="voucher-info">
                          <h3>{voucher.code}</h3>
                          <p className="voucher-desc">{voucher.description}</p>
                          <div className="voucher-details">
                            <span>
                              Giảm{" "}
                              {voucher.discountType === "percentage"
                                ? `${voucher.discount}%`
                                : `${voucher.discount.toLocaleString()}đ`}
                            </span>
                            {voucher.minPurchase && (
                              <span>
                                • Đơn tối thiểu{" "}
                                {voucher.minPurchase.toLocaleString()}đ
                              </span>
                            )}
                          </div>
                          <p className="voucher-expiry">
                            HSD: {formatDate(voucher.expiryDate)}
                          </p>
                        </div>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => copyVoucherCode(voucher.code)}
                      >
                        Sao chép
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiredVouchers.length > 0 && (
              <div className="vouchers-section">
                <h2>Voucher đã hết hạn</h2>
                <div className="vouchers-list">
                  {expiredVouchers.map((voucher) => (
                    <div key={voucher._id} className="voucher-card expired">
                      <div className="voucher-left">
                        <div className="voucher-icon">🎁</div>
                        <div className="voucher-info">
                          <h3>{voucher.code}</h3>
                          <p className="voucher-desc">{voucher.description}</p>
                          <div className="voucher-details">
                            <span>
                              Giảm{" "}
                              {voucher.discountType === "percentage"
                                ? `${voucher.discount}%`
                                : `${voucher.discount.toLocaleString()}đ`}
                            </span>
                          </div>
                          <p className="voucher-expiry expired-text">
                            Đã hết hạn: {formatDate(voucher.expiryDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Vouchers;
