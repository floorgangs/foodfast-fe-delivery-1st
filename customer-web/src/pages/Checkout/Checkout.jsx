import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { loadUser } from "../../store/slices/authSlice";
import { orderAPI, voucherAPI, authAPI } from "../../services/api";
import "./Checkout.css";

// Danh sách gợi ý địa chỉ có sẵn (giống mobile app)
const ADDRESS_SUGGESTIONS = [
  {
    id: 'vincom-dongkhoi',
    label: 'Vincom Đồng Khởi',
    address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
  },
  {
    id: 'landmark81',
    label: 'Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
  },
  {
    id: 'saigoncentre',
    label: 'Saigon Centre',
    address: '65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM',
  },
  {
    id: 'cresentmall',
    label: 'Crescent Mall',
    address: '101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM',
  },
  {
    id: 'citiho',
    label: 'Chung cư CitiHome',
    address: 'Cát Lái, Thành phố Thủ Đức, TP.HCM',
  },
  {
    id: 'vinhomegrandpark',
    label: 'Vinhomes Grand Park',
    address: 'Nguyễn Xiển, Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM',
  },
  {
    id: 'aeonmall-tanphu',
    label: 'Aeon Mall Tân Phú',
    address: '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM',
  },
  {
    id: 'gigamall',
    label: 'Giga Mall Thủ Đức',
    address: '240 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, TP.HCM',
  },
  {
    id: 'parkson-hungthanh',
    label: 'Parkson Hùng Vương',
    address: '126 Hùng Vương, Quận 5, TP.HCM',
  },
  {
    id: 'sunwah',
    label: 'Sunwah Tower',
    address: '115 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM',
  },
];

const QUICK_ADDRESS_TAGS = ['Nhà riêng', 'Văn phòng', 'Chung cư', 'Sảnh bảo vệ'];

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, currentRestaurantId: cartRestaurantId, currentRestaurantName } = useSelector(
    (state) => state.cart
  );

  // Form state
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [loading, setLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // New address form
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    phone: ""
  });
  const [savingAddress, setSavingAddress] = useState(false);
  
  // Address suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(loadUser());
  }, [dispatch, navigate]);

  // Load addresses from user profile
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      // Select first address by default or the default one
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id || defaultAddr.id || "0");
    } else if (user?.address) {
      // Fallback to single address
      const fallbackAddr = {
        _id: "default",
        label: "Nhà",
        address: user.address,
        contactPhone: user.phone || ""
      };
      setAddresses([fallbackAddr]);
      setSelectedAddressId("default");
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      navigate("/");
    }
  }, [items, navigate, isAuthenticated]);

  // Filter suggestions based on input
  const filteredSuggestions = ADDRESS_SUGGESTIONS.filter((item) => {
    const keyword = newAddress.address.trim().toLowerCase();
    if (!keyword) return true; // Show all when empty
    return `${item.label} ${item.address}`.toLowerCase().includes(keyword);
  }).slice(0, 6);

  // Handle select suggestion
  const handleSelectSuggestion = (suggestion) => {
    setNewAddress({
      ...newAddress,
      address: `${suggestion.label}, ${suggestion.address}`,
      label: newAddress.label || suggestion.label,
    });
    setShowSuggestions(false);
  };

  // Handle quick tag click
  const handleQuickTagClick = (tag) => {
    setNewAddress({
      ...newAddress,
      address: newAddress.address ? `${tag} • ${newAddress.address}` : tag,
    });
  };

  const deliveryFee = 15000;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee - discount;

  const selectedAddress = addresses.find(a => (a._id || a.id || addresses.indexOf(a).toString()) === selectedAddressId);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      alert("Vui lòng nhập mã voucher");
      return;
    }

    try {
      setApplyingVoucher(true);
      const response = await voucherAPI.apply(
        voucherCode.toUpperCase(),
        subtotal + deliveryFee,
        cartRestaurantId
      );
      setDiscount(response.data?.discount || 0);
      alert(`Áp dụng thành công! Giảm ${(response.data?.discount || 0).toLocaleString()}đ`);
    } catch (error) {
      alert(error.message || "Mã voucher không hợp lệ");
      setDiscount(0);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      setSavingAddress(true);
      
      // Add new address to existing addresses array
      const updatedAddresses = [
        ...addresses,
        {
          label: newAddress.label,
          address: newAddress.address,
          contactPhone: newAddress.phone || user?.phone || "",
          isDefault: addresses.length === 0
        }
      ];
      
      // Call API to update profile with new addresses
      await authAPI.updateProfile({ addresses: updatedAddresses });
      
      // Refresh user data
      dispatch(loadUser());
      
      // Close modal and reset form
      setShowAddressModal(false);
      setNewAddress({ label: "", address: "", phone: "" });
      alert("Đã thêm địa chỉ mới!");
    } catch (error) {
      alert(error.message || "Không thể thêm địa chỉ");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSelectAddress = (addrId) => {
    setSelectedAddressId(addrId);
    setShowAddressModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const restaurantId = cartRestaurantId || items[0]?.restaurantId;
    if (!restaurantId) {
      alert("Không tìm thấy thông tin nhà hàng!");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        restaurant: restaurantId,
        items: items.map((item) => ({
          product: item.productId || item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          address: selectedAddress.address,
          phone: selectedAddress.contactPhone || selectedAddress.phone || user?.phone || "",
          note: note || "",
        },
        paymentMethod: "paypal",
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: discount,
        total: total,
        customerNote: note || "",
      };

      if (user?.id || user?._id) {
        orderData.customer = user.id || user._id;
      }

      console.log("Creating order:", orderData);
      const orderResponse = await orderAPI.create(orderData);
      const createdOrder = orderResponse?.data ?? orderResponse;

      if (!createdOrder) {
        throw new Error("Không thể tạo đơn hàng");
      }

      console.log("Order created:", createdOrder);

      // Navigate to PayPal payment
      const paypalParams = new URLSearchParams({
        amount: total.toString(),
        description: `Đơn hàng FoodFast #${createdOrder.orderNumber || createdOrder._id}`,
      });
      navigate(`/paypal-payment/${createdOrder._id || createdOrder.id}?${paypalParams.toString()}`);

    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-checkout">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm món ăn vào giỏ hàng trước khi thanh toán</p>
            <button onClick={() => navigate("/")} className="browse-btn">
              Khám phá món ăn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="page-title">Thanh toán</h1>

        <div className="checkout-grid">
          {/* Left Column - Form */}
          <div className="checkout-main">
            {/* Section 1: Địa chỉ giao hàng */}
            <div className="checkout-card">
              <div className="card-header">
                <h2>Địa chỉ giao hàng</h2>
                <button className="change-btn" onClick={() => setShowAddressModal(true)}>
                  Thay đổi
                </button>
              </div>
              
              {selectedAddress ? (
                <div className="selected-address">
                  <div className="address-label">{selectedAddress.label || "Địa chỉ"}</div>
                  <div className="address-text">{selectedAddress.address}</div>
                  {(selectedAddress.contactPhone || selectedAddress.phone) && (
                    <div className="address-phone">SĐT: {selectedAddress.contactPhone || selectedAddress.phone}</div>
                  )}
                </div>
              ) : (
                <div className="no-address">
                  <p>Bạn chưa có địa chỉ giao hàng</p>
                  <button onClick={() => setShowAddressModal(true)} className="add-address-btn">
                    + Thêm địa chỉ
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Đơn hàng */}
            <div className="checkout-card">
              <div className="card-header">
                <h2>Đơn hàng</h2>
                <span className="restaurant-badge">{currentRestaurantName || "Nhà hàng"}</span>
              </div>
              <div className="order-items">
                {items.map((item, index) => (
                  <div key={item.id || item._id || index} className="order-item">
                    <div className="item-qty">{item.quantity}x</div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-price">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Mã giảm giá */}
            <div className="checkout-card">
              <h2>Mã giảm giá</h2>
              <div className="voucher-row">
                <input
                  type="text"
                  placeholder="Nhập mã voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="voucher-input"
                />
                <button
                  className="apply-btn"
                  onClick={handleApplyVoucher}
                  disabled={applyingVoucher}
                >
                  {applyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                </button>
              </div>
              {discount > 0 && (
                <div className="discount-success">
                  Đã giảm: -{discount.toLocaleString("vi-VN")}đ
                </div>
              )}
            </div>

            {/* Section 4: Phương thức thanh toán */}
            <div className="checkout-card">
              <h2>Phương thức thanh toán</h2>
              <div className="payment-info-note">
                Chỉ hỗ trợ thanh toán online để đảm bảo giao hàng nhanh bằng drone
              </div>
              <div className="payment-method selected">
                <img
                  src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                  alt="PayPal"
                  className="payment-logo"
                />
                <div className="payment-details">
                  <span className="payment-name">PayPal</span>
                  <span className="payment-desc">Thanh toán an toàn qua PayPal</span>
                </div>
                <div className="check-icon">✓</div>
              </div>
            </div>

            {/* Section 5: Ghi chú */}
            <div className="checkout-card">
              <h2>Ghi chú cho đơn hàng</h2>
              <textarea
                placeholder="Nhập ghi chú cho nhà hàng hoặc người giao hàng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="note-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="checkout-sidebar">
            <div className="summary-card">
              <h2>Tổng đơn hàng</h2>
              
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Tạm tính ({items.length} món)</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="summary-row">
                  <span>Phí giao hàng (Drone)</span>
                  <span>{deliveryFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
              </div>

              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <span className="total-amount">{total.toLocaleString("vi-VN")}đ</span>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <p className="order-note">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của FoodFast
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn địa chỉ giao hàng</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Existing addresses */}
              <div className="address-list">
                {addresses.map((addr, index) => {
                  const addrId = addr._id || addr.id || index.toString();
                  const isSelected = selectedAddressId === addrId;
                  return (
                    <div
                      key={addrId}
                      className={`address-option ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectAddress(addrId)}
                    >
                      <div className="radio-circle">
                        {isSelected && <div className="radio-dot"></div>}
                      </div>
                      <div className="address-content">
                        <div className="address-label">{addr.label || "Địa chỉ"}</div>
                        <div className="address-text">{addr.address}</div>
                        {(addr.contactPhone || addr.phone) && <div className="address-phone">{addr.contactPhone || addr.phone}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add new address form */}
              <div className="add-address-section">
                <h4>Thêm địa chỉ mới</h4>
                <div className="form-group">
                  <label>Tên địa chỉ</label>
                  <input
                    type="text"
                    placeholder="VD: Nhà riêng, Văn phòng..."
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Số điện thoại nhận hàng"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ chi tiết</label>
                  <textarea
                    placeholder="Số nhà, tên đường, phường, quận, thành phố"
                    value={newAddress.address}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, address: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    rows={3}
                  />
                  
                  {/* Quick tags */}
                  <div className="quick-tags">
                    {QUICK_ADDRESS_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="quick-tag"
                        onClick={() => handleQuickTagClick(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Address suggestions */}
                  {showSuggestions && (
                    <div className="suggestions-list" ref={suggestionsRef}>
                      {filteredSuggestions.length > 0 ? (
                        <>
                          {filteredSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="suggestion-item"
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              <div className="suggestion-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                              </div>
                              <div className="suggestion-content">
                                <div className="suggestion-title">{suggestion.label}</div>
                                <div className="suggestion-subtitle">{suggestion.address}</div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="hide-suggestions-btn"
                            onClick={() => setShowSuggestions(false)}
                          >
                            Ẩn gợi ý
                          </button>
                        </>
                      ) : (
                        <div className="no-suggestions">
                          Không tìm thấy địa chỉ phù hợp, hãy nhập chi tiết hơn.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="save-address-btn"
                  onClick={handleSaveNewAddress}
                  disabled={savingAddress}
                >
                  {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
