import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { checkAuth } from "../../store/slices/authSlice";
import { vietnamLocations } from "../../data/vietnamLocations";
import { createOrder } from "../../services/orderService";
import axios from "axios";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, restaurantId: cartRestaurantId } = useSelector(
    (state) => state.cart
  );

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [useOldAddress, setUseOldAddress] = useState(false);

  // Location selection state
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Dropdown visibility
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Search filters
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  const cityRef = useRef(null);
  const districtRef = useRef(null);
  const wardRef = useRef(null);

  // Voucher state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Saved addresses from user profile
  const [savedAddresses] = useState(
    [
      user?.address
        ? { id: 1, label: "Địa chỉ mặc định", address: user.address }
        : null,
    ].filter(Boolean)
  );

  // Get districts and wards based on selections
  const getDistricts = () => {
    const city = vietnamLocations.cities.find((c) => c.id === selectedCity);
    return city ? city.districts : [];
  };

  const getWards = () => {
    const city = vietnamLocations.cities.find((c) => c.id === selectedCity);
    const district = city?.districts.find((d) => d.id === selectedDistrict);
    return district ? district.wards : [];
  };

  // Filter locations based on search
  const filteredCities = vietnamLocations.cities.filter((city) =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredDistricts = getDistricts().filter((district) =>
    district.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredWards = getWards().filter((ward) =>
    ward.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  // Handle selections
  const handleCitySelect = (city) => {
    setSelectedCity(city.id);
    setCitySearch(city.name);
    setShowCityDropdown(false);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistrictSearch("");
    setWardSearch("");
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district.id);
    setDistrictSearch(district.name);
    setShowDistrictDropdown(false);
    setSelectedWard("");
    setWardSearch("");
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward.id);
    setWardSearch(ward.name);
    setShowWardDropdown(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setShowDistrictDropdown(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target)) {
        setShowWardDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch vouchers from API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoadingVouchers(true);
        const response = await axios.get(`${API_URL}/vouchers`);
        if (response.data.success) {
          setAvailableVouchers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, []);

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
      setStreetAddress(savedAddresses[0].address);
    } else {
      setStreetAddress("");
    }
  }, [useOldAddress, savedAddresses]);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const shippingFee = 15000;
  const subtotal = calculateTotal();

  // Calculate discount
  const discount = selectedVoucher
    ? selectedVoucher.discount || selectedVoucher.discountAmount || 0
    : 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyVoucher = (voucher) => {
    const minRequired = voucher.minPurchase || voucher.minOrder || 0;
    if (minRequired > subtotal) {
      alert(
        `Đơn hàng tối thiểu ${minRequired.toLocaleString()}đ để áp dụng mã này`
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate with detailed messages
    const errors = [];
    if (!name) errors.push("Họ và tên");
    if (!phone) errors.push("Số điện thoại");
    if (!streetAddress) errors.push("Địa chỉ (trước số nhà)");
    if (!selectedCity) errors.push("Thành phố");
    if (!selectedDistrict) errors.push("Quận/Huyện");
    if (!selectedWard) errors.push("Phường/Xã");

    if (errors.length > 0) {
      alert(`Vui lòng nhập: ${errors.join(", ")}`);
      return;
    }

    // Build full address
    const cityName = vietnamLocations.cities.find(
      (c) => c.id === selectedCity
    )?.name;
    const districtName = getDistricts().find(
      (d) => d.id === selectedDistrict
    )?.name;
    const wardName = getWards().find((w) => w.id === selectedWard)?.name;
    const fullAddress = `${streetAddress}, ${wardName}, ${districtName}, ${cityName}`;

    // Get restaurant info - ALWAYS use cartRestaurantId first
    const restaurantId = cartRestaurantId || items[0]?.restaurantId;

    if (!restaurantId) {
      alert("Không tìm thấy thông tin nhà hàng!");
      return;
    }

    // Fetch restaurant details from API
    let restaurantName = "Nhà hàng";
    let restaurantAddress = "";

    try {
      const res = await axios.get(`${API_URL}/restaurants/${restaurantId}`);
      if (res.data.success) {
        restaurantName = res.data.data.name;
        restaurantAddress = `${res.data.data.address?.street}, ${res.data.data.address?.district}, ${res.data.data.address?.city}`;
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }

    console.log("=== Creating order with restaurantId:", restaurantId);

    try {
      // Create order first (for all payment methods)
      const orderPayload = {
        restaurant: restaurantId,
        items: items.map((item) => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          address: fullAddress,
          phone: phone,
          note: note || "",
        },
        paymentMethod: paymentMethod === "vnpay" ? "banking" : paymentMethod,
        subtotal: subtotal,
        deliveryFee: shippingFee,
        discount: selectedVoucher?.discount || 0,
        total: total,
        customerNote: note || "",
      };

      // Add customer if authenticated
      if (user?.id) {
        orderPayload.customer = user.id;
      } else {
        // Guest order
        orderPayload.customerInfo = {
          name: name,
          phone: phone,
          email: user?.email || `${phone}@guest.foodfast.vn`,
        };
      }

      console.log("📦 Creating order:", orderPayload);

      const token = localStorage.getItem("token");
      const orderResponse = await axios.post(
        `${API_URL}/orders`,
        orderPayload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || "Không thể tạo đơn hàng");
      }

      const createdOrder = orderResponse.data.data;
      console.log("✅ Order created:", createdOrder);

      // Handle payment based on method
      if (paymentMethod === "vnpay") {
        // Create VNPay payment
        const paymentResponse = await axios.post(
          `${API_URL}/payments/vnpay/create`,
          {
            orderId: createdOrder._id,
            amount: total,
            orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber}`,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (paymentResponse.data.success) {
          // Redirect to VNPay
          window.location.href = paymentResponse.data.data.paymentUrl;
        } else {
          throw new Error("Không thể tạo thanh toán VNPay");
        }
      } else if (paymentMethod === "momo") {
        // Create MoMo payment
        const paymentResponse = await axios.post(
          `${API_URL}/payments/momo/create`,
          {
            orderId: createdOrder._id,
            amount: total,
            orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber}`,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (paymentResponse.data.success) {
          // Redirect to MoMo
          window.location.href = paymentResponse.data.data.paymentUrl;
        } else {
          throw new Error("Không thể tạo thanh toán MoMo");
        }
      } else {
        // COD: Navigate to order tracking immediately
        dispatch(clearCart());
        navigate(`/order-tracking/${createdOrder._id}`);
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
      console.error("❌ Backend response:", error.response?.data);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi đặt hàng"
      );
    }
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
                    placeholder="Họ và tên"
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
                    placeholder="Số điện thoại"
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
                    Địa chỉ (trước sáp nhập)<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                    required
                    disabled={useOldAddress}
                  />
                </div>

                <div className="address-row">
                  <div className="form-group location-select" ref={cityRef}>
                    <input
                      type="text"
                      value={citySearch}
                      onFocus={() => {
                        setCitySearch("");
                        setShowCityDropdown(true);
                      }}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Thành phố"
                      disabled={useOldAddress}
                      autoComplete="off"
                    />
                    {showCityDropdown && (
                      <div className="location-dropdown">
                        {filteredCities.map((city) => (
                          <div
                            key={city.id}
                            className={`dropdown-item ${
                              selectedCity === city.id ? "selected" : ""
                            }`}
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group location-select" ref={districtRef}>
                    <input
                      type="text"
                      value={districtSearch}
                      onFocus={() => {
                        if (selectedCity) {
                          setDistrictSearch("");
                          setShowDistrictDropdown(true);
                        }
                      }}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="Quận/Huyện"
                      disabled={!selectedCity || useOldAddress}
                      autoComplete="off"
                    />
                    {showDistrictDropdown && selectedCity && (
                      <div className="location-dropdown">
                        {filteredDistricts.map((district) => (
                          <div
                            key={district.id}
                            className={`dropdown-item ${
                              selectedDistrict === district.id ? "selected" : ""
                            }`}
                            onClick={() => handleDistrictSelect(district)}
                          >
                            {district.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group location-select" ref={wardRef}>
                    <input
                      type="text"
                      value={wardSearch}
                      onFocus={() => {
                        if (selectedDistrict) {
                          setWardSearch("");
                          setShowWardDropdown(true);
                        }
                      }}
                      onChange={(e) => setWardSearch(e.target.value)}
                      placeholder="Phường/Xã"
                      disabled={!selectedDistrict || useOldAddress}
                      autoComplete="off"
                    />
                    {showWardDropdown && selectedDistrict && (
                      <div className="location-dropdown">
                        {filteredWards.map((ward) => (
                          <div
                            key={ward.id}
                            className={`dropdown-item ${
                              selectedWard === ward.id ? "selected" : ""
                            }`}
                            onClick={() => handleWardSelect(ward)}
                          >
                            {ward.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    <div className="payment-icon">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div className="payment-details">
                      <strong className="payment-title">
                        Thanh toán khi nhận hàng (COD)
                      </strong>
                      <p className="payment-desc">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
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
                    <div className="payment-icon">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5f/VNPAY_logo.png"
                        alt="VNPay"
                        className="pay-logo"
                      />
                    </div>
                    <div className="payment-details">
                      <strong className="payment-title">VNPay</strong>
                      <p className="payment-desc">Thanh toán qua VNPay</p>
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
                    <div className="payment-icon">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/62/MoMo_Logo.png"
                        alt="MoMo"
                        className="pay-logo"
                      />
                    </div>
                    <div className="payment-details">
                      <strong className="payment-title">Momo</strong>
                      <p className="payment-desc">Thanh toán qua ví Momo</p>
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
                  <div key={item._id || item.id} className="order-item">
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

              {loadingVouchers ? (
                <div className="voucher-loading">
                  <p>Đang tải mã khuyến mãi...</p>
                </div>
              ) : availableVouchers.length > 0 ? (
                <div className="voucher-list">
                  {availableVouchers.map((voucher) => (
                    <div
                      key={voucher._id || voucher.id}
                      className="voucher-item"
                    >
                      <div className="voucher-item-content">
                        <div className="voucher-icon">🎟️</div>
                        <div className="voucher-details">
                          <strong>{voucher.name || voucher.title}</strong>
                          <p>{voucher.description}</p>
                          <small>
                            Giảm:{" "}
                            {(
                              voucher.discount ||
                              voucher.discountAmount ||
                              0
                            ).toLocaleString()}
                            đ
                            {voucher.minPurchase > 0
                              ? ` - Đơn tối thiểu ${voucher.minPurchase.toLocaleString()}đ`
                              : ""}
                          </small>
                        </div>
                      </div>
                      <button
                        className="select-voucher-btn"
                        onClick={() => handleApplyVoucher(voucher)}
                        disabled={
                          (voucher.minPurchase || voucher.minOrder || 0) >
                          subtotal
                        }
                      >
                        {(voucher.minPurchase || voucher.minOrder || 0) >
                        subtotal
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
