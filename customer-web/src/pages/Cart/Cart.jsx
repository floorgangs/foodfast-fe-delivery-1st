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
  const { items, total, currentRestaurantName } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      try {
        await dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
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
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm món ăn yêu thích vào giỏ hàng</p>
            <button onClick={() => navigate("/")} className="browse-btn">
              Khám phá món ăn
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
        {currentRestaurantName && (
          <p className="cart-restaurant">Nhà hàng: {currentRestaurantName}</p>
        )}

        <div className="cart-content">
          <div className="cart-left">
            <div className="cart-header">
              <h3>Sản phẩm ({items.length})</h3>
              <button
                onClick={async () => {
                  try {
                    await dispatch(clearCart());
                  } catch (error) {
                    console.error('Failed to clear cart:', error);
                  }
                }}
                className="clear-all-btn"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image || '/placeholder.png'} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-restaurant">
                      {item.restaurantName || "Nhà hàng"}
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
                      onClick={() => handleRemove(item.id)}
                      className="remove-btn"
                      title="Xóa sản phẩm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
              Tiến hành đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
