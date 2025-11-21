import { useState, useEffect } from "react";
import "./Promotions.css";

function Promotions() {
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [promotions, setPromotions] = useState([]);

  // Load promotions từ localStorage
  useEffect(() => {
    const promotionsKey = "foodfastRestaurantPromotions_2";
    const stored = window.localStorage.getItem(promotionsKey);
    if (stored) {
      try {
        const promos = JSON.parse(stored);
        setPromotions(promos);
      } catch (error) {
        console.error("Error loading promotions:", error);
      }
    }
  }, []);

  // Save promotions to localStorage whenever it changes
  useEffect(() => {
    if (promotions.length > 0) {
      const promotionsKey = "foodfastRestaurantPromotions_2";
      window.localStorage.setItem(promotionsKey, JSON.stringify(promotions));
    }
  }, [promotions]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
  });

  const getFilteredPromotions = () => {
    switch (activeTab) {
      case "active":
        return promotions.filter((p) => p.status === "active");
      case "expired":
        return promotions.filter((p) => p.status === "expired");
      case "upcoming":
        return promotions.filter((p) => p.status === "upcoming");
      default:
        return promotions;
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPromotion = {
      id: `p${Date.now()}`,
      ...formData,
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder),
      maxDiscount: parseFloat(formData.maxDiscount),
      usageLimit: parseInt(formData.usageLimit),
      usedCount: 0,
      status: "active",
    };
    setPromotions([newPromotion, ...promotions]);
    setShowCreateModal(false);
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      minOrder: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
    });
  };

  const toggleStatus = (id) => {
    setPromotions(
      promotions.map((promo) =>
        promo.id === id
          ? {
              ...promo,
              status: promo.status === "active" ? "expired" : "active",
            }
          : promo
      )
    );
  };

  const deletePromotion = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const filteredPromotions = getFilteredPromotions();

  return (
    <div className="promotions-page">
      <div className="page-header">
        <div>
          <h1>Quản lý khuyến mãi</h1>
          <p className="subtitle">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="create-btn">
          + Tạo khuyến mãi mới
        </button>
      </div>

      <div className="promotions-tabs">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Đang hoạt động
          <span className="tab-count">
            {promotions.filter((p) => p.status === "active").length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "expired" ? "active" : ""}`}
          onClick={() => setActiveTab("expired")}
        >
          Đã kết thúc
          <span className="tab-count">
            {promotions.filter((p) => p.status === "expired").length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Sắp diễn ra
          <span className="tab-count">
            {promotions.filter((p) => p.status === "upcoming").length}
          </span>
        </button>
      </div>

      <div className="promotions-list">
        {filteredPromotions.length === 0 ? (
          <div className="empty-state">
            <p>Không có khuyến mãi nào</p>
          </div>
        ) : (
          filteredPromotions.map((promo) => (
            <div key={promo.id} className={`promo-card ${promo.status}`}>
              <div className="promo-header">
                <div className="promo-info">
                  <span className={`promo-type ${promo.type}`}>
                    {promo.type === "percentage" && "% Giảm giá"}
                    {promo.type === "fixed" && "₫ Giảm tiền"}
                    {promo.type === "freeship" && "🚁 Miễn phí ship"}
                  </span>
                  <h3>{promo.name}</h3>
                  <p className="promo-code">
                    Mã: <strong>{promo.code}</strong>
                  </p>
                </div>
                <div className="promo-status">
                  <span className={`status-badge ${promo.status}`}>
                    {promo.status === "active" && "Đang hoạt động"}
                    {promo.status === "expired" && "Đã kết thúc"}
                    {promo.status === "upcoming" && "Sắp diễn ra"}
                  </span>
                </div>
              </div>

              <div className="promo-details">
                <div className="detail-row">
                  <span className="detail-label">Giá trị:</span>
                  <span className="detail-value">
                    {promo.type === "percentage" && `${promo.value}%`}
                    {promo.type === "fixed" &&
                      `${promo.value.toLocaleString("vi-VN")}đ`}
                    {promo.type === "freeship" && "Miễn phí ship"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Đơn tối thiểu:</span>
                  <span className="detail-value">
                    {promo.minOrder.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giảm tối đa:</span>
                  <span className="detail-value">
                    {promo.maxDiscount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">
                    {promo.startDate} - {promo.endDate}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lượt sử dụng:</span>
                  <span className="detail-value">
                    {promo.usedCount}/{promo.usageLimit}
                    <div className="usage-bar">
                      <div
                        className="usage-fill"
                        style={{
                          width: `${
                            (promo.usedCount / promo.usageLimit) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </span>
                </div>
              </div>

              <div className="promo-actions">
                <button
                  onClick={() => toggleStatus(promo.id)}
                  className={`toggle-btn ${promo.status}`}
                >
                  {promo.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                </button>
                <button
                  onClick={() => deletePromotion(promo.id)}
                  className="delete-btn"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo khuyến mãi mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên khuyến mãi *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Giảm 20% cho đơn từ 100k"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mã khuyến mãi *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: GIAM20"
                  required
                />
              </div>

              <div className="form-group">
                <label>Loại khuyến mãi *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="percentage">Giảm theo phần trăm (%)</option>
                  <option value="fixed">Giảm theo số tiền cố định (₫)</option>
                  <option value="freeship">Miễn phí ship</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá trị *</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder={
                      formData.type === "percentage" ? "20" : "50000"
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giảm tối đa *</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Đơn hàng tối thiểu *</label>
                <input
                  type="number"
                  name="minOrder"
                  value={formData.minOrder}
                  onChange={handleChange}
                  placeholder="100000"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giới hạn sử dụng *</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  Tạo khuyến mãi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Promotions;
