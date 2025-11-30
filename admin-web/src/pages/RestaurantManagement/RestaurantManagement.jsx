import { useState, useEffect } from "react";
import { restaurantAPI } from "../../services/api";
import "./RestaurantManagement.css";

function RestaurantManagement() {
  const [filter, setFilter] = useState("all"); // all, active, pending, suspended, rejected
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [formData, setFormData] = useState({
    // Restaurant fields
    name: "",
    description: "",
    phone: "",
    addressStreet: "",
    addressCity: "",
    addressDistrict: "",
    addressWard: "",
    deliveryFee: "15000",
    minOrder: "0",
    estimatedDeliveryTime: "30-45 phút",
    avatar: "",
    coverImage: "",
    // Owner fields
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "",
  });

  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  
  const cuisineOptions = [
    "Việt Nam", "Thái Lan", "Nhật Bản", "Hàn Quốc", "Trung Quốc",
    "Ý", "Pháp", "Mỹ", "Ấn Độ", "Món nướng", "Lẩu", "Hải sản",
    "Chay", "Buffet", "Fast Food", "Đồ uống", "Tráng miệng", "Khác"
  ];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      // Sử dụng API admin để lấy tất cả nhà hàng (bao gồm chưa duyệt)
      const response = await restaurantAPI.getAllRestaurantsAdmin();

      if (response.success) {
        const apiRestaurants = response.data || [];
        // Transform to match UI format
        const transformed = apiRestaurants.map((r) => ({
          id: r._id,
          name: r.name,
          owner: r.owner?.name || "N/A",
          ownerEmail: r.owner?.email || "N/A",
          phone: r.phone || r.owner?.phone || "N/A",
          email: r.email || r.owner?.email || "N/A",
          address:
            typeof r.address === "string"
              ? r.address
              : `${r.address?.street || ""}, ${r.address?.district || ""}, ${
                  r.address?.city || ""
                }`.trim(),
          status: r.compliance?.status === "rejected" 
            ? "rejected"
            : r.isApproved
              ? r.isActive
                ? "active"
                : "suspended"
              : "pending",
          rating: r.rating || 0,
          orders: r.totalOrders || 0,
          revenue: r.totalRevenue || 0,
          joined: r.createdAt,
          description: r.description || "",
          cuisine: r.cuisine || [],
          compliance: r.compliance,
          isApproved: r.isApproved,
          isActive: r.isActive,
        }));
        setRestaurants(transformed);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      alert("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: "Hoạt động",
      pending: "Chờ duyệt",
      suspended: "Đã khóa",
      rejected: "Đã từ chối",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleViewRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setComplianceData(null);
    setShowViewModal(true);

    // Load compliance data if pending or rejected
    if (restaurant.status === "pending" || restaurant.status === "rejected") {
      try {
        const response = await restaurantAPI.getRestaurantCompliance(restaurant.id);
        if (response.success) {
          setComplianceData(response.data);
        }
      } catch (error) {
        console.error("Error loading compliance:", error);
      }
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Bạn có chắc muốn duyệt nhà hàng này?")) return;

    try {
      setProcessing(true);
      const response = await restaurantAPI.approveRestaurant(id);

      if (response.success) {
        await loadRestaurants();
        setShowViewModal(false);
        alert("Đã duyệt nhà hàng thành công!");
      }
    } catch (error) {
      console.error("Error approving restaurant:", error);
      alert(error.message || "Không thể duyệt nhà hàng");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setProcessing(true);
      const response = await restaurantAPI.rejectRestaurant(
        selectedRestaurant.id,
        rejectReason
      );

      if (response.success) {
        await loadRestaurants();
        setShowRejectModal(false);
        setShowViewModal(false);
        setRejectReason("");
        alert("Đã từ chối nhà hàng!");
      }
    } catch (error) {
      console.error("Error rejecting restaurant:", error);
      alert(error.message || "Không thể từ chối nhà hàng");
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!confirm("Bạn có chắc muốn khóa nhà hàng này?")) return;

    try {
      setProcessing(true);
      const response = await restaurantAPI.updateRestaurant(id, { isActive: false });

      if (response.success) {
        await loadRestaurants();
        setShowViewModal(false);
        alert("Đã khóa nhà hàng!");
      }
    } catch (error) {
      console.error("Error suspending restaurant:", error);
      alert(error.message || "Không thể khóa nhà hàng");
    } finally {
      setProcessing(false);
    }
  };

  const handleActivate = async (id) => {
    if (!confirm("Bạn có chắc muốn kích hoạt lại nhà hàng này?")) return;

    try {
      setProcessing(true);
      const response = await restaurantAPI.updateRestaurant(id, { isActive: true });

      if (response.success) {
        await loadRestaurants();
        setShowViewModal(false);
        alert("Đã kích hoạt lại nhà hàng!");
      }
    } catch (error) {
      console.error("Error activating restaurant:", error);
      alert(error.message || "Không thể kích hoạt nhà hàng");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.ownerName || !formData.ownerEmail || !formData.ownerPassword) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc (đánh dấu *)");
      return;
    }

    if (!formData.addressStreet) {
      alert("Vui lòng nhập địa chỉ nhà hàng");
      return;
    }

    if (!formData.ownerPhone || !formData.phone) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.ownerEmail)) {
      alert("Email không hợp lệ");
      return;
    }

    // Validate password
    if (formData.ownerPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.ownerPhone) || !phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ (10-11 số)");
      return;
    }

    try {
      setProcessing(true);
      
      const payload = {
        // Restaurant info
        name: formData.name.trim(),
        description: formData.description.trim(),
        cuisine: selectedCuisines.length > 0 ? selectedCuisines : [],
        address: {
          street: formData.addressStreet.trim(),
          city: formData.addressCity.trim(),
          district: formData.addressDistrict.trim(),
          ward: formData.addressWard.trim(),
        },
        phone: formData.phone.trim(),
        deliveryFee: parseFloat(formData.deliveryFee) || 15000,
        minOrder: parseFloat(formData.minOrder) || 0,
        estimatedDeliveryTime: formData.estimatedDeliveryTime.trim() || "30-45 phút",
        avatar: formData.avatar || undefined,
        coverImage: formData.coverImage || undefined,
        // Owner info
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim().toLowerCase(),
        ownerPhone: formData.ownerPhone.trim(),
        ownerPassword: formData.ownerPassword,
      };

      console.log("Creating restaurant with payload:", payload);

      const response = await restaurantAPI.createRestaurantWithOwner(payload);

      if (response.success) {
        alert(`✅ Tạo nhà hàng thành công!\n\nThông tin đăng nhập:\nEmail: ${payload.ownerEmail}\nMật khẩu: (đã tạo)\n\nChủ nhà hàng có thể đăng nhập ngay!`);
        setShowCreateModal(false);
        resetForm();
        await loadRestaurants();
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert(error.message || "Không thể tạo nhà hàng. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      phone: "",
      addressStreet: "",
      addressCity: "",
      addressDistrict: "",
      addressWard: "",
      deliveryFee: "15000",
      minOrder: "0",
      estimatedDeliveryTime: "30-45 phút",
      avatar: "",
      coverImage: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerPassword: "",
    });
    setSelectedCuisines([]);
    setAvatarPreview("");
    setCoverPreview("");
  };

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === 'avatar') {
          setFormData(prev => ({ ...prev, avatar: base64String }));
          setAvatarPreview(base64String);
        } else {
          setFormData(prev => ({ ...prev, coverImage: base64String }));
          setCoverPreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getTabCounts = () => ({
    all: restaurants.length,
    active: restaurants.filter((r) => r.status === "active").length,
    pending: restaurants.filter((r) => r.status === "pending").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
    rejected: restaurants.filter((r) => r.status === "rejected").length,
  });

  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="restaurant-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý nhà hàng</h1>
          <p className="page-description">
            Quản lý và xét duyệt tất cả nhà hàng trong hệ thống
          </p>
        </div>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          + Thêm nhà hàng
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({tabCounts.all})
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            <span className="pending-dot"></span>
            Chờ duyệt ({tabCounts.pending})
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Đang hoạt động ({tabCounts.active})
          </button>
          <button
            className={`filter-btn ${filter === "suspended" ? "active" : ""}`}
            onClick={() => setFilter("suspended")}
          >
            Đã khóa ({tabCounts.suspended})
          </button>
          <button
            className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Đã từ chối ({tabCounts.rejected})
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="restaurants-table">
        <table>
          <thead>
            <tr>
              <th>Tên nhà hàng</th>
              <th>Chủ quán</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
              <th>Đơn hàng</th>
              <th>Doanh thu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  Không có nhà hàng nào
                </td>
              </tr>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className={restaurant.status === "pending" ? "pending-row" : ""}>
                  <td>
                    <strong>{restaurant.name}</strong>
                  </td>
                  <td>{restaurant.owner}</td>
                  <td>{restaurant.phone}</td>
                  <td className="address-cell">{restaurant.address}</td>
                  <td>
                    <span className={getStatusClass(restaurant.status)}>
                      {getStatusText(restaurant.status)}
                    </span>
                  </td>
                  <td>
                    {restaurant.rating > 0 ? (
                      <span className="rating">⭐ {restaurant.rating}</span>
                    ) : (
                      <span className="no-rating">Chưa có</span>
                    )}
                  </td>
                  <td>{restaurant.orders}</td>
                  <td>{(restaurant.revenue / 1000000).toFixed(1)}M</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewRestaurant(restaurant)}
                      >
                        Chi tiết
                      </button>
                      {restaurant.status === "pending" && (
                        <>
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(restaurant.id)}
                            disabled={processing}
                          >
                            Duyệt
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setShowRejectModal(true);
                            }}
                            disabled={processing}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {restaurant.status === "active" && (
                        <button
                          className="action-btn suspend"
                          onClick={() => handleSuspend(restaurant.id)}
                          disabled={processing}
                        >
                          Tạm khóa
                        </button>
                      )}
                      {restaurant.status === "suspended" && (
                        <button
                          className="action-btn activate"
                          onClick={() => handleActivate(restaurant.id)}
                          disabled={processing}
                        >
                          Kích hoạt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin nhà hàng</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="label">Tên nhà hàng:</span>
                    <span className="value restaurant-name">
                      {selectedRestaurant.name}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Chủ quán:</span>
                    <span className="value">{selectedRestaurant.owner}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedRestaurant.ownerEmail}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số điện thoại:</span>
                    <span className="value">{selectedRestaurant.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedRestaurant.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày đăng ký:</span>
                    <span className="value">
                      {new Date(selectedRestaurant.joined).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge ${selectedRestaurant.status}`}>
                      {getStatusText(selectedRestaurant.status)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRestaurant.status === "active" && (
                <div className="info-section">
                  <h3>Thông tin kinh doanh</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="label">Đánh giá:</span>
                      <span className="value rating-value">
                        {selectedRestaurant.rating > 0
                          ? `⭐ ${selectedRestaurant.rating}`
                          : "Chưa có đánh giá"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Tổng đơn hàng:</span>
                      <span className="value order-count">
                        {selectedRestaurant.orders.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Doanh thu:</span>
                      <span className="value revenue-value">
                        {selectedRestaurant.revenue.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance info for pending/rejected restaurants */}
              {(selectedRestaurant.status === "pending" || selectedRestaurant.status === "rejected") && (
                <>
                  {complianceData ? (
                    <>
                      <div className="info-section">
                        <h3>📄 Thông tin CCCD</h3>
                        <div className="info-grid">
                          <div className="info-row">
                            <span className="label">Số CCCD:</span>
                            <span className="value">
                              {complianceData.compliance?.idCard?.number || "Chưa cung cấp"}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Ngày cấp:</span>
                            <span className="value">
                              {complianceData.compliance?.idCard?.issueDate
                                ? new Date(complianceData.compliance.idCard.issueDate).toLocaleDateString("vi-VN")
                                : "Chưa cung cấp"}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Nơi cấp:</span>
                            <span className="value">
                              {complianceData.compliance?.idCard?.issuePlace || "Chưa cung cấp"}
                            </span>
                          </div>
                        </div>
                        <div className="document-preview">
                          {complianceData.compliance?.idCard?.frontImage && (
                            <div className="doc-item">
                              <label>CCCD mặt trước</label>
                              <img src={complianceData.compliance.idCard.frontImage} alt="CCCD mặt trước" />
                            </div>
                          )}
                          {complianceData.compliance?.idCard?.backImage && (
                            <div className="doc-item">
                              <label>CCCD mặt sau</label>
                              <img src={complianceData.compliance.idCard.backImage} alt="CCCD mặt sau" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="info-section">
                        <h3>📋 Giấy phép kinh doanh</h3>
                        <div className="document-preview">
                          {complianceData.compliance?.businessLicense?.documentImage ? (
                            <div className="doc-item">
                              <img
                                src={complianceData.compliance.businessLicense.documentImage}
                                alt="Giấy phép kinh doanh"
                              />
                            </div>
                          ) : (
                            <p className="no-doc">Chưa cung cấp giấy phép kinh doanh</p>
                          )}
                        </div>
                      </div>

                      <div className="info-section">
                        <h3>💰 Thông tin thuế</h3>
                        <div className="info-grid">
                          <div className="info-row">
                            <span className="label">Mã số thuế:</span>
                            <span className="value">
                              {complianceData.compliance?.tax?.code || "Chưa cung cấp"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="info-section">
                      <p className="loading-text">Đang tải thông tin hồ sơ...</p>
                    </div>
                  )}

                  {selectedRestaurant.status === "rejected" && selectedRestaurant.compliance?.rejectionReason && (
                    <div className="info-section rejection-info">
                      <h3>❌ Lý do từ chối</h3>
                      <div className="rejection-box">
                        <p>{selectedRestaurant.compliance.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              {selectedRestaurant.status === "pending" && (
                <>
                  <button
                    className="action-btn reject"
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                  >
                    Từ chối
                  </button>
                  <button
                    className="action-btn approve"
                    onClick={() => handleApprove(selectedRestaurant.id)}
                    disabled={processing}
                  >
                    {processing ? "Đang xử lý..." : "Duyệt nhà hàng"}
                  </button>
                </>
              )}
              {selectedRestaurant.status === "active" && (
                <button
                  className="action-btn suspend"
                  onClick={() => handleSuspend(selectedRestaurant.id)}
                  disabled={processing}
                >
                  Tạm khóa
                </button>
              )}
              {selectedRestaurant.status === "suspended" && (
                <button
                  className="action-btn activate"
                  onClick={() => handleActivate(selectedRestaurant.id)}
                  disabled={processing}
                >
                  Kích hoạt lại
                </button>
              )}
              <button className="action-btn close" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Từ chối nhà hàng</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Vui lòng nhập lý do từ chối để thông báo cho chủ nhà hàng:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className="reject-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="action-btn close" onClick={() => setShowRejectModal(false)}>
                Hủy
              </button>
              <button
                className="action-btn reject"
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
              >
                {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-content create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Thêm nhà hàng mới</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRestaurant}>
              <div className="modal-body">
                <div className="form-section">
                  <h3 className="section-title">Thông tin nhà hàng</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Tên nhà hàng *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập tên nhà hàng"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Ảnh đại diện (Logo)</label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          id="avatar"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'avatar')}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="avatar" className="image-upload-label">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar preview" className="image-preview" />
                          ) : (
                            <div className="image-placeholder">
                              <span className="upload-icon">📷</span>
                              <span className="upload-text">Chọn ảnh đại diện</span>
                              <span className="upload-hint">Tối đa 5MB</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Ảnh bìa</label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          id="coverImage"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'cover')}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="coverImage" className="image-upload-label">
                          {coverPreview ? (
                            <img src={coverPreview} alt="Cover preview" className="image-preview" />
                          ) : (
                            <div className="image-placeholder">
                              <span className="upload-icon">🖼️</span>
                              <span className="upload-text">Chọn ảnh bìa</span>
                              <span className="upload-hint">Tối đa 5MB</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại nhà hàng *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addressStreet">Địa chỉ (Số nhà, đường) *</label>
                    <input
                      type="text"
                      id="addressStreet"
                      name="addressStreet"
                      value={formData.addressStreet}
                      onChange={handleChange}
                      required
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="addressWard">Phường/Xã</label>
                      <input
                        type="text"
                        id="addressWard"
                        name="addressWard"
                        value={formData.addressWard}
                        onChange={handleChange}
                        placeholder="Nhập phường/xã"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="addressDistrict">Quận/Huyện</label>
                      <input
                        type="text"
                        id="addressDistrict"
                        name="addressDistrict"
                        value={formData.addressDistrict}
                        onChange={handleChange}
                        placeholder="Nhập quận/huyện"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="addressCity">Thành phố</label>
                      <input
                        type="text"
                        id="addressCity"
                        name="addressCity"
                        value={formData.addressCity}
                        onChange={handleChange}
                        placeholder="Nhập thành phố"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Loại ẩm thực</label>
                    <div className="cuisine-tags">
                      {cuisineOptions.map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          className={`cuisine-tag ${selectedCuisines.includes(cuisine) ? 'active' : ''}`}
                          onClick={() => toggleCuisine(cuisine)}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                    <small className="form-hint">Chọn các loại ẩm thực phù hợp</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Mô tả</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Nhập mô tả về nhà hàng"
                      rows="3"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="deliveryFee">Phí giao hàng (VNĐ)</label>
                      <input
                        type="number"
                        id="deliveryFee"
                        name="deliveryFee"
                        value={formData.deliveryFee}
                        onChange={handleChange}
                        min="0"
                        placeholder="15000"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="minOrder">Đơn tối thiểu (VNĐ)</label>
                      <input
                        type="number"
                        id="minOrder"
                        name="minOrder"
                        value={formData.minOrder}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="estimatedDeliveryTime">Thời gian giao hàng dự kiến</label>
                    <input
                      type="text"
                      id="estimatedDeliveryTime"
                      name="estimatedDeliveryTime"
                      value={formData.estimatedDeliveryTime}
                      onChange={handleChange}
                      placeholder="30-45 phút"
                    />
                  </div>
                </div>

                <div className="form-divider"></div>

                <div className="form-section">
                  <h3 className="section-title">Thông tin chủ nhà hàng</h3>
                  
                  <div className="form-group">
                    <label htmlFor="ownerName">Tên chủ nhà hàng *</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="ownerEmail">Email đăng nhập *</label>
                      <input
                        type="email"
                        id="ownerEmail"
                        name="ownerEmail"
                        value={formData.ownerEmail}
                        onChange={handleChange}
                        required
                        placeholder="Nhập email"
                      />
                      <small className="form-hint">Email này sẽ dùng để đăng nhập hệ thống</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="ownerPhone">Số điện thoại *</label>
                      <input
                        type="tel"
                        id="ownerPhone"
                        name="ownerPhone"
                        value={formData.ownerPhone}
                        onChange={handleChange}
                        required
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="ownerPassword">Mật khẩu *</label>
                    <input
                      type="password"
                      id="ownerPassword"
                      name="ownerPassword"
                      value={formData.ownerPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Nhập mật khẩu"
                    />
                    <small className="form-hint">Mật khẩu tối thiểu 6 ký tự</small>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    disabled={processing}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-create"
                    disabled={processing}
                  >
                    {processing ? "Đang tạo..." : "Tạo nhà hàng"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantManagement;
