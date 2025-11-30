import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentMethods.css";

function PaymentMethods() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([
    {
      id: "1",
      type: "paypal",
      email: "user@example.com",
      isDefault: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleAdd = () => {
    setFormData({ email: "" });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này?")) {
      return;
    }
    setMethods(methods.filter((method) => method.id !== id));
  };

  const handleSave = () => {
    if (!formData.email.trim()) {
      alert("Vui lòng nhập email PayPal");
      return;
    }

    const newMethod = {
      id: Date.now().toString(),
      type: "paypal",
      email: formData.email,
      isDefault: methods.length === 0,
    };
    setMethods([...methods, newMethod]);
    setModalVisible(false);
  };

  const handleSetDefault = (id) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  return (
    <div className="payment-methods-page">
      <div className="container">
        <button onClick={() => navigate("/profile")} className="back-btn">
          ← Quay lại
        </button>

        <div className="payment-card">
          <h1>Phương thức thanh toán</h1>
          <p className="subtitle">Quản lý phương thức thanh toán của bạn</p>

          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <p>
              Hiện tại chỉ hỗ trợ thanh toán qua PayPal để đảm bảo giao hàng
              nhanh bằng drone
            </p>
          </div>

          <div className="methods-list">
            {methods.map((method) => (
              <div key={method.id} className="method-card">
                <div className="method-header">
                  <div className="method-info">
                    <img
                      src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                      alt="PayPal"
                      className="paypal-logo"
                    />
                    <div className="method-details">
                      <div className="method-name-row">
                        <span className="method-name">PayPal</span>
                        {method.isDefault && (
                          <span className="default-badge">Mặc định</span>
                        )}
                      </div>
                      <span className="method-text">{method.email}</span>
                    </div>
                  </div>
                </div>

                <div className="method-actions">
                  {!method.isDefault && (
                    <button
                      className="set-default-btn"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(method.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            <button className="add-method-btn" onClick={handleAdd}>
              + Thêm tài khoản PayPal
            </button>
          </div>
        </div>

        {/* Modal */}
        {modalVisible && (
          <div className="modal-overlay" onClick={() => setModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thêm tài khoản PayPal</h2>
                <button
                  className="modal-close"
                  onClick={() => setModalVisible(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-form">
                <div className="paypal-logo-container">
                  <img
                    src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                    alt="PayPal"
                    className="paypal-logo-large"
                  />
                  <span className="paypal-title">PayPal</span>
                </div>

                <div className="form-group">
                  <label>Email PayPal</label>
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ email: e.target.value })}
                    autoComplete="email"
                  />
                  <p className="helper-text">
                    Nhập địa chỉ email đã đăng ký với tài khoản PayPal của bạn
                  </p>
                </div>

                <div className="info-box">
                  <span className="info-box-icon">💡</span>
                  <p>
                    Bạn sẽ được chuyển đến trang PayPal để đăng nhập và xác nhận
                    thanh toán khi đặt hàng
                  </p>
                </div>

                <button className="save-btn" onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentMethods;
