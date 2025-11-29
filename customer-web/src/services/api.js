import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and expired tokens
api.interceptors.response.use(
  (response) => response?.data || response,
  async (error) => {
    if (error?.response?.status === 401) {
      // Token expired, clear storage and require re-login
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Restaurant APIs
export const restaurantAPI = {
  getAll: (params) => api.get("/restaurants", { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  search: (keyword) => api.get("/restaurants", { params: { search: keyword } }),
};

// Product APIs
export const productAPI = {
  getByRestaurant: (restaurantId) => api.get("/products", { params: { restaurantId } }),
  getById: (id) => api.get(`/products/${id}`),
  search: (keyword, restaurantId) => api.get("/products", { params: { search: keyword, restaurantId } }),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getMyOrders: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  track: (id) => api.get(`/orders/${id}/track`),
};

// Voucher APIs
export const voucherAPI = {
  getAll: () => api.get("/vouchers"),
  getById: (id) => api.get(`/vouchers/${id}`),
  apply: (code, orderTotal, restaurantId) => api.post("/vouchers/apply", { code, orderTotal, restaurantId }),
};

// Drone APIs
export const droneAPI = {
  getAll: () => api.get("/drones"),
  getByRestaurant: (restaurantId) => api.get(`/drones/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/drones/${id}`),
};

// Review APIs
export const reviewAPI = {
  getAll: (params) => api.get("/reviews", { params }),
  getSummary: (params) => api.get("/reviews/summary", { params }),
  create: (payload) => api.post("/reviews", payload),
  reply: (id, payload) => api.post(`/reviews/${id}/reply`, payload),
};

// Payment APIs
export const paymentAPI = {
  confirmThirdParty: async (payload) => {
    console.log('[paymentAPI] confirmThirdParty payload:', payload);
    try {
      const response = await api.post('/orders/confirm-payment', payload);
      console.log('[paymentAPI] confirmThirdParty response:', response);
      return response;
    } catch (error) {
      console.error('[paymentAPI] confirmThirdParty error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};

// PayPal APIs
export const paypalAPI = {
  createOrder: (data) => api.post('/paypal/create-order', data),
  captureOrder: (data) => api.post('/paypal/capture-order', data),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get("/cart"),
  upsert: (payload) => api.put("/cart", payload),
  clear: () => api.delete("/cart"),
};

// Saved Orders APIs
export const savedOrderAPI = {
  getAll: (params) => api.get("/saved-orders", { params }),
  create: (payload) => api.post("/saved-orders", payload),
  update: (id, payload) => api.put(`/saved-orders/${id}`, payload),
  delete: (id) => api.delete(`/saved-orders/${id}`),
  orderFrom: (id) => api.post(`/saved-orders/${id}/order`),
};

export default api;
