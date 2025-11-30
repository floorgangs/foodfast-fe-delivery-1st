import axios from "axios";

const resolveDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  return "http://localhost:5000/api";
};

const API_URL = resolveDefaultApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("restaurant_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🔵 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    console.error("🔴 Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi và token hết hạn
api.interceptors.response.use(
  (response) => {
    console.log("🟢 API Response:", {
      url: response.config.url,
      status: response.status,
      success: response.data?.success,
    });
    return response.data;
  },
  async (error) => {
    console.error("🔴 API Error:", {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config
        ? `${error.config.baseURL}${error.config.url}`
        : "N/A",
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      isNetworkError: error.message === "Network Error",
    });

    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized - redirecting to login");
      // Token hết hạn, xóa và chuyển về login
      localStorage.removeItem("restaurant_token");
      localStorage.removeItem("restaurant_user");
      localStorage.removeItem("restaurant_data");
      window.location.href = "/login";
    }

    return Promise.reject(error.response?.data || { message: error.message });
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) =>
    api.post("/auth/login", { email, password, role: "restaurant" }),

  register: (data) => api.post("/auth/register", data),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data) => api.put("/auth/profile", data),
};

// Alias for restaurant auth (for compatibility)
export const restaurantAuthAPI = authAPI;

// Restaurant APIs
export const restaurantAPI = {
  getAll: (params) => api.get("/restaurants", { params }),
  getMyRestaurant: () => api.get("/restaurants/my-restaurant"),
  create: (data) => api.post("/restaurants", data),
  updateRestaurant: (id, data) => api.put(`/restaurants/${id}`, data),
  getById: (id) => api.get(`/restaurants/${id}`),
};

// Product APIs
export const productAPI = {
  getByRestaurant: (restaurantId, includeHidden = false) =>
    api.get("/products", {
      params: {
        restaurantId,
        includeHidden: includeHidden ? "true" : "false",
      },
    }),

  getById: (id) => api.get(`/products/${id}`),

  create: (data) => api.post("/products", data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`),
};

// Order APIs
export const orderAPI = {
  getMyOrders: (params) => api.get("/orders", { params }),

  getById: (id) => api.get(`/orders/${id}`),

  updateStatus: (id, status, note) =>
    api.put(`/orders/${id}/status`, { status, note }),

  getAvailableDrones: (params) =>
    api.get("/deliveries/drones/available", { params }),

  assignDrone: ({ orderId, droneId }) =>
    api.post("/deliveries/assign", { orderId, droneId }),
};

// Drone APIs
export const droneAPI = {
  getMyDrones: (restaurantId) => api.get(`/drones/restaurant/${restaurantId}`),

  getById: (id) => api.get(`/drones/${id}`),

  create: (data) => api.post("/drones", data),

  update: (id, data) => api.put(`/drones/${id}`, data),

  updateStatus: (id, status, batteryLevel) =>
    api.put(`/drones/${id}/status`, { status, batteryLevel }),

  delete: (id) => api.delete(`/drones/${id}`),
};

// Review APIs
export const reviewAPI = {
  getAll: (params) => api.get("/reviews", { params }),
  getSummary: (params) => api.get("/reviews/summary", { params }),
  reply: (id, data) => api.post(`/reviews/${id}/reply`, data),
};

// Voucher APIs
export const voucherAPI = {
  getAll: (params) => api.get("/vouchers", { params }),
  getById: (id) => api.get(`/vouchers/${id}`),
  create: (data) => api.post("/vouchers", data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
};

// Staff APIs
export const staffAPI = {
  getByRestaurant: (restaurantId) => api.get(`/staff/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/staff/${id}`),
  create: (restaurantId, data) => api.post(`/staff/restaurant/${restaurantId}`, data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export default api;
