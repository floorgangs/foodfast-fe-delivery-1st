import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import { createOrder } from "../../store/slices/orderSlice";
import "./Cart.css";

function Cart() {
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Lưu URL hiện tại để redirect sau khi login
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const shippingFee = 15000;

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="container">
          <div className="empty-cart">
            <h2>🛒</h2>
            <p>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => navigate("/")} className="browse-btn">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Giỏ hàng của bạn</h1>

        <div className="cart-content">
          <div className="cart-left">
            <div className="cart-header">
              <h3>Sản phẩm ({items.length})</h3>
              <button
                onClick={() => dispatch(clearCart())}
                className="clear-all-btn"
              >
                🗑️ Xóa tất cả
              </button>
            </div>

            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-restaurant">
                      {item.restaurant || "Cơm Tấm Sài Gòn"}
                    </p>
                    <p className="item-price">
                      {item.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="remove-btn"
                      title="Xóa sản phẩm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="summary-row">
              <span>Tạm tính ({items.length} món):</span>
              <span>{total.toLocaleString("vi-VN")} đ</span>
            </div>

            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span>{shippingFee.toLocaleString("vi-VN")} đ</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-price">
                {(total + shippingFee).toLocaleString("vi-VN")} đ
              </span>
            </div>

            <button onClick={handleCheckout} className="checkout-btn">
              🛒 Tiến hành đặt hàng
            </button>

            <button onClick={() => navigate("/")} className="continue-btn">
              Tiếp tục mua hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
