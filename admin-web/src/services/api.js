// Admin API Service - kết nối trực tiếp với backend
const API_BASE_URL = "http://localhost:5000/api";

// Helper function để lấy auth token
const getAuthToken = () => {
  return localStorage.getItem("admin_token");
};

// Helper function để tạo headers
const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  login: async (email, password) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return apiCall("/auth/profile");
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  verifyPassword: async (password) => {
    return apiCall("/auth/verify-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },
};

// ==================== ORDER API ====================
export const orderAPI = {
  // Lấy tất cả orders (admin có thể lấy tất cả)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/orders?${queryString}` : "/orders";
    return apiCall(endpoint);
  },

  // Lấy order theo ID
  getOrderById: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },

  // Track order (theo dõi đơn hàng)
  track: async (orderId) => {
    return apiCall(`/orders/${orderId}/track`);
  },

  // Cập nhật status của order
  updateOrderStatus: async (orderId, status) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Lấy thống kê đơn hàng
  getOrderStats: async () => {
    return apiCall("/orders/stats");
  },
};

// ==================== RESTAURANT API ====================
export const restaurantAPI = {
  // Lấy tất cả restaurants (public)
  getAllRestaurants: async () => {
    return apiCall("/restaurants");
  },

  // Lấy restaurant theo ID
  getRestaurantById: async (restaurantId) => {
    return apiCall(`/restaurants/${restaurantId}`);
  },

  // Cập nhật restaurant
  updateRestaurant: async (restaurantId, data) => {
    return apiCall(`/restaurants/${restaurantId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Cập nhật trạng thái restaurant
  updateRestaurantStatus: async (restaurantId, status) => {
    return apiCall(`/restaurants/${restaurantId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // ==================== ADMIN APPROVAL ====================
  // Lấy tất cả restaurants cho admin (bao gồm chưa duyệt)
  getAllRestaurantsAdmin: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/restaurants/admin/all?${queryString}`
      : "/restaurants/admin/all";
    return apiCall(endpoint);
  },

  // Lấy danh sách nhà hàng chờ duyệt
  getPendingRestaurants: async () => {
    return apiCall("/restaurants/admin/pending");
  },

  // Duyệt nhà hàng
  approveRestaurant: async (restaurantId, notes) => {
    return apiCall(`/restaurants/admin/${restaurantId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  },

  // Từ chối nhà hàng
  rejectRestaurant: async (restaurantId, reason) => {
    return apiCall(`/restaurants/admin/${restaurantId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  // Lấy thông tin compliance của nhà hàng
  getRestaurantCompliance: async (restaurantId) => {
    return apiCall(`/restaurants/admin/${restaurantId}/compliance`);
  },

  // Tạo nhà hàng mới kèm tài khoản owner (admin only)
  createRestaurantWithOwner: async (data) => {
    return apiCall("/restaurants/admin/create-with-owner", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Xóa nhà hàng
  deleteRestaurant: async (restaurantId) => {
    return apiCall(`/restaurants/${restaurantId}`, {
      method: "DELETE",
    });
  },
};

// ==================== USER API ====================
export const userAPI = {
  // Lấy tất cả users
  getAllUsers: async () => {
    return apiCall("/auth/users");
  },

  // Lấy user theo ID
  getUserById: async (userId) => {
    return apiCall(`/auth/users/${userId}`);
  },

  // Cập nhật status user (khóa/mở)
  updateUserStatus: async (userId, isActive) => {
    return apiCall(`/auth/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  },
};

// ==================== DRONE API ====================
export const droneAPI = {
  // Lấy tất cả drones
  getAllDrones: async () => {
    return apiCall("/drones");
  },

  // Lấy drone theo ID
  getDroneById: async (droneId) => {
    return apiCall(`/drones/${droneId}`);
  },

  // Tạo drone mới
  createDrone: async (droneData) => {
    return apiCall("/drones", {
      method: "POST",
      body: JSON.stringify(droneData),
    });
  },

  // Cập nhật drone
  updateDrone: async (droneId, droneData) => {
    return apiCall(`/drones/${droneId}`, {
      method: "PUT",
      body: JSON.stringify(droneData),
    });
  },

  // Xóa drone
  deleteDrone: async (droneId) => {
    return apiCall(`/drones/${droneId}`, {
      method: "DELETE",
    });
  },
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  // Lấy overview stats
  getOverview: async () => {
    return apiCall("/dashboard/overview");
  },

  // Lấy revenue stats
  getRevenue: async (period = "month") => {
    return apiCall(`/dashboard/revenue?period=${period}`);
  },

  // Lấy recent orders
  getRecentOrders: async (limit = 10) => {
    return apiCall(`/dashboard/recent-orders?limit=${limit}`);
  },
};

// ==================== TRANSACTION API ====================
export const transactionAPI = {
  // Lấy tất cả transactions
  getAllTransactions: async () => {
    return apiCall("/transactions");
  },

  // Lấy transactions theo restaurant
  getRestaurantTransactions: async (restaurantId) => {
    return apiCall(`/transactions/restaurant/${restaurantId}`);
  },

  // Tạo withdrawal request (rút tiền)
  createWithdrawal: async (restaurantId, amount, paypalEmail) => {
    return apiCall("/transactions/withdraw", {
      method: "POST",
      body: JSON.stringify({ restaurantId, amount, paypalEmail }),
    });
  },

  // Xử lý withdrawal (approve/reject)
  processWithdrawal: async (transactionId, action, note) => {
    return apiCall(`/transactions/${transactionId}/process`, {
      method: "PUT",
      body: JSON.stringify({ action, note }),
    });
  },
};

// ==================== ADMIN SETTINGS API ====================
export const adminSettingsAPI = {
  // Lấy settings
  getSettings: async () => {
    return apiCall("/admin-settings");
  },

  // Cập nhật PayPal settings
  updatePayPalSettings: async (
    paypalEmail,
    paypalClientId,
    paypalClientSecret
  ) => {
    return apiCall("/admin-settings/paypal", {
      method: "PUT",
      body: JSON.stringify({ paypalEmail, paypalClientId, paypalClientSecret }),
    });
  },

  // Cập nhật commission rate
  updateCommissionRate: async (commissionRate, minWithdrawAmount) => {
    return apiCall("/admin-settings/commission", {
      method: "PUT",
      body: JSON.stringify({ commissionRate, minWithdrawAmount }),
    });
  },
};

export default {
  authAPI,
  orderAPI,
  restaurantAPI,
  userAPI,
  droneAPI,
  dashboardAPI,
  transactionAPI,
  adminSettingsAPI,
};
