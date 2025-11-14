import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { checkAuth } from "../../store/slices/authSlice";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [useOldAddress, setUseOldAddress] = useState(false);

  // Voucher state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");

  // Mock vouchers
  const [availableVouchers] = useState([
    {
      id: 1,
      code: "FREESHIP50",
      title: "Miễn phí vận chuyển",
      description: "Giảm 50% phí vận chuyển",
      discount: 7500,
      type: "shipping",
      minOrder: 0,
    },
    {
      id: 2,
      code: "GIAM20K",
      title: "Giảm 20K",
      description: "Giảm 20.000đ cho đơn hàng từ 100.000đ",
      discount: 20000,
      type: "order",
      minOrder: 100000,
    },
    {
      id: 3,
      code: "NEWUSER",
      title: "Khách hàng mới",
      description: "Giảm 30.000đ cho đơn hàng đầu tiên",
      discount: 30000,
      type: "order",
      minOrder: 50000,
    },
  ]);

  // Saved addresses from user profile
  const [savedAddresses] = useState(
    [
      user?.address
        ? { id: 1, label: "Địa chỉ mặc định", address: user.address }
        : null,
    ].filter(Boolean)
  );

  useEffect(() => {
    // Check localStorage first on mount
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Restore auth from localStorage
    dispatch(checkAuth());
  }, [dispatch, navigate]);

  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      navigate("/");
    }
  }, [items, navigate, isAuthenticated]);

  useEffect(() => {
    if (useOldAddress && savedAddresses.length > 0) {
      setAddress(savedAddresses[0].address);
    }
  }, [useOldAddress, savedAddresses]);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const shippingFee = 15000;
  const subtotal = calculateTotal();

  // Calculate discount
  const discount = selectedVoucher ? selectedVoucher.discount : 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyVoucher = (voucher) => {
    if (voucher.minOrder > subtotal) {
      alert(
        `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString()}đ để áp dụng mã này`
      );
      return;
    }
    setSelectedVoucher(voucher);
    setShowVoucherModal(false);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherCode("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone || !address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // Mock order creation
    const order = {
      id: "ORD-" + Date.now(),
      items: items,
      customer: { name, phone, address },
      note,
      paymentMethod,
      subtotal,
      shippingFee,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("Order created:", order);

    // Clear cart and redirect
    dispatch(clearCart());
    alert("Đặt hàng thành công! Mã đơn hàng: " + order.id);
    navigate("/order-tracking");
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Thanh toán</h1>

        <div className="checkout-grid">
          {/* Left: Shipping Info */}
          <div className="checkout-left">
            <form onSubmit={handleSubmit}>
              <div className="checkout-section">
                <h2>Thông tin giao hàng</h2>

                <div className="form-group">
                  <label>
                    Họ và tên<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={user?.name || "Nhập họ và tên"}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Số điện thoại<span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={user?.phone || "Nhập số điện thoại"}
                    required
                  />
                </div>

                {savedAddresses.length > 0 && (
                  <div className="saved-addresses">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={useOldAddress}
                        onChange={(e) => setUseOldAddress(e.target.checked)}
                      />
                      <span>Sử dụng địa chỉ đã lưu</span>
                    </label>
                    {useOldAddress && (
                      <div className="address-list">
                        {savedAddresses.map((addr) => (
                          <div key={addr.id} className="address-item">
                            <strong>{addr.label}</strong>
                            <p>{addr.address}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>
                    Địa chỉ giao hàng<span className="required">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng"
                    rows="3"
                    required
                    disabled={useOldAddress}
                  />
                </div>

                <div className="form-group">
                  <label>Ghi chú (không bắt buộc)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú cho người giao hàng..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Mã khuyến mãi</label>
                  {!selectedVoucher ? (
                    <button
                      type="button"
                      className="voucher-select-btn"
                      onClick={() => setShowVoucherModal(true)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Chọn mã khuyến mãi
                    </button>
                  ) : (
                    <div className="selected-voucher">
                      <div className="voucher-info">
                        <strong>{selectedVoucher.title}</strong>
                        <p>{selectedVoucher.description}</p>
                      </div>
                      <button
                        type="button"
                        className="remove-voucher-btn"
                        onClick={handleRemoveVoucher}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="checkout-section">
                <h2>Phương thức thanh toán</h2>

                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <div className="payment-icon">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <div className="payment-icon">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="1" y="4" width="22" height="16" rx="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <strong>VNPay</strong>
                        <p>Thanh toán qua VNPay</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <div className="payment-icon">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <div>
                        <strong>Momo</strong>
                        <p>Thanh toán qua ví Momo</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="checkout-btn">
                Đặt hàng ngay
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-right">
            <div className="order-summary">
              <h2>Đơn hàng</h2>

              <div className="order-items">
                {items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <p>
                        {item.quantity} x {item.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div className="item-total">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <strong>{subtotal.toLocaleString("vi-VN")}đ</strong>
                </div>
                <div className="total-row">
                  <span>Phí giao hàng:</span>
                  <strong>{shippingFee.toLocaleString("vi-VN")}đ</strong>
                </div>
                {selectedVoucher && (
                  <div className="total-row discount-row">
                    <span>Giảm giá ({selectedVoucher.code}):</span>
                    <strong className="discount-amount">
                      -{discount.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Tổng cộng:</span>
                  <strong className="total-amount">
                    {total.toLocaleString("vi-VN")}đ
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowVoucherModal(false)}
        >
          <div className="voucher-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Chọn mã khuyến mãi
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowVoucherModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="voucher-input-section">
                <input
                  type="text"
                  placeholder="Nhập mã khuyến mãi"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                />
                <button
                  className="apply-code-btn"
                  onClick={() => {
                    const voucher = availableVouchers.find(
                      (v) => v.code === voucherCode
                    );
                    if (voucher) {
                      handleApplyVoucher(voucher);
                    } else {
                      alert("Mã khuyến mãi không hợp lệ");
                    }
                  }}
                >
                  Áp dụng
                </button>
              </div>

              {availableVouchers.length > 0 ? (
                <div className="voucher-list">
                  {availableVouchers.map((voucher) => (
                    <div key={voucher.id} className="voucher-item">
                      <div className="voucher-item-content">
                        <div className="voucher-icon">🎟️</div>
                        <div className="voucher-details">
                          <strong>{voucher.title}</strong>
                          <p>{voucher.description}</p>
                          <small>
                            {voucher.minOrder > 0
                              ? `Đơn tối thiểu ${voucher.minOrder.toLocaleString()}đ`
                              : "Không giới hạn"}
                          </small>
                        </div>
                      </div>
                      <button
                        className="select-voucher-btn"
                        onClick={() => handleApplyVoucher(voucher)}
                        disabled={voucher.minOrder > subtotal}
                      >
                        {voucher.minOrder > subtotal
                          ? "Không đủ điều kiện"
                          : "Chọn"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-vouchers">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <p>Không có voucher khả dụng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
