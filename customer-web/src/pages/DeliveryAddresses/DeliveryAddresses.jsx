import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, loadUser } from "../../store/slices/authSlice";
import "./DeliveryAddresses.css";

const ADDRESS_SUGGESTIONS = [
  {
    id: "vincom-dongkhoi",
    label: "Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    id: "landmark81",
    label: "Landmark 81",
    address: "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM",
  },
  {
    id: "saigoncentre",
    label: "Saigon Centre",
    address: "65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    id: "cresentmall",
    label: "Crescent Mall",
    address: "101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM",
  },
  {
    id: "citiho",
    label: "Chung cư CitiHome",
    address: "Cát Lái, Thành phố Thủ Đức, TP.HCM",
  },
  {
    id: "vinhomegrandpark",
    label: "Vinhomes Grand Park",
    address: "Nguyễn Xiển, Long Thạnh Mỹ, TP.Thủ Đức, TP.HCM",
  },
];

const QUICK_ADDRESS_TAGS = ["Nhà riêng", "Văn phòng", "Chung cư", "Sảnh bảo vệ"];

function DeliveryAddresses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    phone: "",
    address: "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fallbackPhone = user?.phone ?? "";

  useEffect(() => {
    if (user?.addresses && Array.isArray(user.addresses)) {
      const normalized = user.addresses.map((entry, index) => ({
        id: entry._id || entry.id || `addr-${index}-${Date.now()}`,
        mongoId: entry._id,
        label: entry.label || entry.name || "Địa chỉ",
        contactName: entry.contactName || entry.recipientName || entry.label || "",
        phone: entry.contactPhone || entry.phone || fallbackPhone,
        address: entry.address || entry.fullAddress || "",
        isDefault: Boolean(entry.isDefault),
      }));
      setAddresses(normalized);
    }
  }, [user?.addresses, fallbackPhone]);

  const toBackendPayload = (entries) =>
    entries.map((item) => ({
      _id: item.mongoId,
      label: item.label,
      contactName: item.contactName ?? item.label,
      contactPhone: item.phone,
      address: item.address,
      isDefault: item.isDefault,
    }));

  const persistAddresses = async (next) => {
    try {
      setSaving(true);
      await dispatch(updateProfile({ addresses: toBackendPayload(next) })).unwrap();
      await dispatch(loadUser()).unwrap();
      return true;
    } catch (error) {
      alert(error?.message || "Không thể lưu địa chỉ. Vui lòng thử lại.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const filteredSuggestions = ADDRESS_SUGGESTIONS.filter((item) => {
    const keyword = formData.address.trim().toLowerCase();
    if (!keyword) return true;
    return `${item.label} ${item.address}`.toLowerCase().includes(keyword);
  }).slice(0, 6);

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({ label: "", phone: fallbackPhone, address: "" });
    setShowSuggestions(false);
    setModalVisible(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      phone: address.phone,
      address: address.address,
    });
    setShowSuggestions(false);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    const next = addresses
      .filter((addr) => addr.id !== id)
      .map((addr) => ({ ...addr }));

    if (next.length > 0 && !next.some((addr) => addr.isDefault)) {
      next[0].isDefault = true;
    }

    const success = await persistAddresses(next);
    if (success) {
      setAddresses(next);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: `${suggestion.label}, ${suggestion.address}`,
      label: prev.label || suggestion.label,
    }));
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    const trimmedLabel = formData.label.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedPhone = formData.phone.trim() || fallbackPhone;

    if (!trimmedLabel || !trimmedAddress) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    let next;

    if (editingAddress) {
      next = addresses.map((addr) => {
        if (addr.id !== editingAddress.id) {
          return { ...addr };
        }
        return {
          ...addr,
          label: trimmedLabel,
          contactName: addr.contactName || trimmedLabel,
          phone: trimmedPhone,
          address: trimmedAddress,
        };
      });
    } else {
      const newAddress = {
        id: `addr-${Date.now()}`,
        label: trimmedLabel,
        contactName: trimmedLabel,
        phone: trimmedPhone,
        address: trimmedAddress,
        isDefault: addresses.length === 0,
      };
      next = [...addresses.map((addr) => ({ ...addr })), newAddress];
    }

    if (next.length > 0 && !next.some((addr) => addr.isDefault)) {
      next[0].isDefault = true;
    }

    const success = await persistAddresses(next);
    if (success) {
      setAddresses(next);
      setModalVisible(false);
      setShowSuggestions(false);
      setEditingAddress(null);
      setFormData({ label: "", phone: fallbackPhone, address: "" });
    }
  };

  const handleSetDefault = async (id) => {
    const next = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));

    const success = await persistAddresses(next);
    if (success) {
      setAddresses(next);
    }
  };

  return (
    <div className="delivery-addresses-page">
      <div className="container">
        <button onClick={() => navigate("/profile")} className="back-btn">
          ← Quay lại
        </button>

        <div className="addresses-card">
          <h1>Địa chỉ giao hàng</h1>
          <p className="subtitle">Quản lý địa chỉ nhận hàng của bạn</p>

          <div className="addresses-list">
            {addresses.map((address) => (
              <div key={address.id} className="address-card">
                <div className="address-header">
                  <div className="address-name-row">
                    <span className="address-name">{address.label}</span>
                    {address.isDefault && (
                      <span className="default-badge">Mặc định</span>
                    )}
                  </div>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(address)}
                  >
                    Sửa
                  </button>
                </div>

                <p className="address-phone">{address.phone}</p>
                <p className="address-text">{address.address}</p>

                <div className="address-actions">
                  {!address.isDefault && (
                    <button
                      className="set-default-btn"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(address.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            <button className="add-address-btn" onClick={handleAdd}>
              + Thêm địa chỉ mới
            </button>
          </div>
        </div>

        {/* Modal */}
        {modalVisible && (
          <div className="modal-overlay" onClick={() => setModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
                <button
                  className="modal-close"
                  onClick={() => setModalVisible(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-form">
                <div className="form-group">
                  <label>Tên địa chỉ</label>
                  <input
                    type="text"
                    placeholder="VD: Nhà riêng, Văn phòng"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ chi tiết</label>
                  <textarea
                    placeholder="Số nhà, tên đường, phường, quận, thành phố"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    rows={3}
                  />

                  <div className="quick-tags">
                    {QUICK_ADDRESS_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="quick-tag"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            address: prev.address
                              ? `${tag} • ${prev.address}`
                              : tag,
                          }));
                          setShowSuggestions(true);
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {showSuggestions && (
                    <div className="suggestion-list">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((item) => (
                          <div
                            key={item.id}
                            className="suggestion-item"
                            onClick={() => handleSelectSuggestion(item)}
                          >
                            <span className="suggestion-title">{item.label}</span>
                            <span className="suggestion-subtitle">
                              {item.address}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-suggestion">
                          Không tìm thấy địa chỉ phù hợp
                        </p>
                      )}
                      <button
                        type="button"
                        className="hide-suggestion-btn"
                        onClick={() => setShowSuggestions(false)}
                      >
                        Ẩn gợi ý
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className={`save-btn ${saving ? "disabled" : ""}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryAddresses;
