import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL_KEY = "@custom_api_url";

// IMPORTANT: Có 3 cách kết nối backend
// 1. CUSTOM URL (trong app) - Ưu tiên cao nhất.
// 2. NGROK (Khuyên dùng) - Hoạt động mọi máy, mọi mạng
// 3. LAN IP - Chỉ hoạt động cùng mạng WiFi

// ===== CÁCH 1: CUSTOM URL (Đặt trong app, xem ProfileScreen) =====
// Người dùng có thể nhập URL trong app mà không cần edit code!

// ===== CÁCH 2: NGROK (Khuyên dùng) =====
// Bước 1: Cài ngrok: https://ngrok.com/download
// Bước 2: Chạy backend: cd backend && npm run dev
// Bước 3: Chạy ngrok: ngrok http 5000
// Bước 4: Copy URL từ ngrok (VD: https://abc123.ngrok.io)
// Bước 5: Paste vào NGROK_URL bên dưới HOẶC trong app
const NGROK_URL = ""; // VD: 'https://abc123.ngrok.io'

// ===== CÁCH 3: LAN IP =====
const DEFAULT_LAN_IP = "172.18.247.106"; // IP máy tính chạy backend (Updated: 2025-12-01)

// ===== TEST: GitHub Actions CI Pipeline =====
// This comment is added to test CI workflow
// Date: 2025-12-01

// ===== BUILD URL =====
const buildAPIURL = () => {
  if (NGROK_URL) {
    return `${NGROK_URL}/api`;
  }
  return __DEV__
    ? `http://${DEFAULT_LAN_IP}:5000/api`
    : "https://your-production-api.com/api";
};

let BASE_API_URL = buildAPIURL();

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Update base URL dynamically from AsyncStorage
(async () => {
  try {
    const customURL = await AsyncStorage.getItem(API_URL_KEY);
    if (customURL) {
      BASE_API_URL = `${customURL}/api`;
      api.defaults.baseURL = BASE_API_URL;

      if (__DEV__) {
        console.log(`\n=================================`);
        console.log(`🎯 Dùng CUSTOM URL: ${BASE_API_URL}`);
        console.log(`✏️  Đổi URL trong: Profile > Cấu hình Server`);
        console.log(`=================================\n`);
      }
    } else if (__DEV__) {
      console.log(`\n=================================`);
      if (NGROK_URL) {
        console.log(`🌐 Dùng NGROK: ${BASE_API_URL}`);
        console.log(`✅ Hoạt động trên mọi máy, mọi mạng!`);
      } else {
        console.log(`🌐 API URL: ${BASE_API_URL}`);
        console.log(`📱 Platform: ${Platform.OS}`);
        console.log(`⚠️  Dùng LAN IP - phải cùng WiFi`);
        console.log(`💡 Tip: Dùng ngrok hoặc đổi URL trong app!`);
      }
      console.log(`=================================\n`);
    }
  } catch (error) {
    console.error("Error loading custom URL:", error);
  }
})();

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi và token hết hạn
api.interceptors.response.use(
  (response) => response?.data || response,
  async (error) => {
    // Log chi tiết để debug
    if (__DEV__) {
      console.error("❌ API Error:", {
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data,
      });
    }

    // Network error - không kết nối được backend
    if (error?.message === "Network Error" || error?.code === "ECONNABORTED") {
      const networkError = new Error(
        `Không kết nối được server. Vui lòng kiểm tra:\n` +
          `1. Backend đã chạy chưa? (npm run dev trong thư mục backend)\n` +
          `2. URL đúng chưa? (hiện tại: ${api.defaults.baseURL})\n` +
          `3. Nếu dùng LAN IP, máy tính và điện thoại cùng mạng WiFi?\n` +
          `💡 Đổi URL trong: Profile > Cấu hình Server`
      );
      return Promise.reject(networkError);
    }

    if (error?.response?.status === 401) {
      // Token hết hạn, xóa và yêu cầu đăng nhập lại
      try {
        await AsyncStorage.multiRemove(["token", "user"]);
      } catch (e) {
        console.error("Error clearing storage:", e);
      }
    }
    const errorMessage =
      error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (data: any) => api.post("/auth/register", data),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data: any) => api.put("/auth/profile", data),
};

// Restaurant APIs
export const restaurantAPI = {
  getAll: (params?: any) => api.get("/restaurants", { params }),

  getById: (id: string) => api.get(`/restaurants/${id}`),

  search: (keyword: string) =>
    api.get("/restaurants", { params: { search: keyword } }),
};

// Product APIs
export const productAPI = {
  getByRestaurant: (restaurantId: string) =>
    api.get("/products", { params: { restaurantId } }),

  getById: (id: string) => api.get(`/products/${id}`),

  search: (keyword: string, restaurantId?: string) =>
    api.get("/products", { params: { search: keyword, restaurantId } }),
};

// Order APIs
export const orderAPI = {
  create: (orderData: any) => api.post("/orders", orderData),

  getMyOrders: () => api.get("/orders"),

  getById: (id: string) => api.get(`/orders/${id}`),

  cancel: (id: string, reason: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),

  track: (id: string) => api.get(`/orders/${id}/track`),

  confirmDelivery: (id: string) => api.put(`/orders/${id}/confirm-delivery`),

  complete: (id: string) => api.patch(`/orders/${id}/complete`),
};

// Voucher APIs
export const voucherAPI = {
  getAll: () => api.get("/vouchers"),

  getById: (id: string) => api.get(`/vouchers/${id}`),

  apply: (code: string, orderTotal: number, restaurantId?: string) =>
    api.post("/vouchers/apply", { code, orderTotal, restaurantId }),
};

// Drone APIs
export const droneAPI = {
  getAll: () => api.get("/drones"),

  getByRestaurant: (restaurantId: string) =>
    api.get(`/drones/restaurant/${restaurantId}`),

  getById: (id: string) => api.get(`/drones/${id}`),
};

// Review APIs
export const reviewAPI = {
  getAll: (params?: any) => api.get("/reviews", { params }),
  getSummary: (params?: any) => api.get("/reviews/summary", { params }),
  create: (payload: any) => api.post("/reviews", payload),
  reply: (id: string, payload: { comment: string }) =>
    api.post(`/reviews/${id}/reply`, payload),
};

export const paymentAPI = {
  confirmThirdParty: async (payload: {
    orderId: string;
    sessionId: string;
    status: "success" | "failed";
  }) => {
    console.log("[paymentAPI] confirmThirdParty payload:", payload);
    try {
      const response = await api.post("/orders/confirm-payment", payload);
      console.log("[paymentAPI] confirmThirdParty response:", response);
      return response;
    } catch (error: any) {
      console.error("[paymentAPI] confirmThirdParty error:", {
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
  createOrder: async (payload: {
    amount: number;
    orderId: string;
    description?: string;
  }) => {
    console.log("[paypalAPI] createOrder payload:", payload);
    try {
      const response = await api.post("/paypal/create-order", payload);
      console.log("[paypalAPI] createOrder response:", response);
      return response;
    } catch (error: any) {
      console.error("[paypalAPI] createOrder error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  captureOrder: async (payload: { paypalOrderId: string; orderId: string }) => {
    console.log("[paypalAPI] captureOrder payload:", payload);
    try {
      const response = await api.post("/paypal/capture-order", payload);
      console.log("[paypalAPI] captureOrder response:", response);
      return response;
    } catch (error: any) {
      console.error("[paypalAPI] captureOrder error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: JSON.stringify(error),
      });
      // Nếu đã capture rồi, coi như thành công
      if (
        error.response?.data?.error?.details?.[0]?.issue ===
        "ORDER_ALREADY_CAPTURED"
      ) {
        return {
          success: true,
          data: { status: "COMPLETED", alreadyCaptured: true },
        };
      }
      throw error;
    }
  },
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get("/notifications"),

  getUnreadCount: () => api.get("/notifications/unread-count"),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put("/notifications/mark-all-read"),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get("/cart"),
  upsert: (payload: any) => api.put("/cart", payload),
  clear: () => api.delete("/cart"),
};

// Saved Orders APIs
export const savedOrderAPI = {
  getAll: (params?: any) => api.get("/saved-orders", { params }),
  create: (payload: any) => api.post("/saved-orders", payload),
  update: (id: string, payload: any) => api.put(`/saved-orders/${id}`, payload),
  delete: (id: string) => api.delete(`/saved-orders/${id}`),
  orderFrom: (id: string) => api.post(`/saved-orders/${id}/order`),
};

export default api;
