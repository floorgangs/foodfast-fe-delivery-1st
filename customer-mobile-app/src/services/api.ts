import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// IMPORTANT: Thay YOUR_IP bằng IP máy tính chạy backend
// Windows: Chạy ipconfig trong CMD để xem IPv4 Address
// Mac/Linux: Chạy ifconfig để xem IP
// Choose a sensible default for development depending on platform:
// - Android emulator: use your machine LAN IP (NOT 10.0.2.2 if having issues)
// - iOS simulator / physical device: use your machine LAN IP
const DEFAULT_LAN_IP = '192.168.1.85'; // <-- Backend is accessible on this IP
const DEV_HOST = DEFAULT_LAN_IP; // Use LAN IP for both Android and iOS
const API_URL = __DEV__
  ? `http://${DEV_HOST}:5000/api`
  : 'https://your-production-api.com/api';

// Helpful debug log so you can see which backend URL the app is using
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(`[api] Using API_URL=${API_URL} (Platform=${Platform.OS})`);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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
    if (error?.response?.status === 401) {
      // Token hết hạn, xóa và yêu cầu đăng nhập lại
      try {
        await AsyncStorage.multiRemove(['token', 'user']);
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
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

// Restaurant APIs
export const restaurantAPI = {
  getAll: (params?: any) =>
    api.get('/restaurants', { params }),
  
  getById: (id: string) =>
    api.get(`/restaurants/${id}`),
  
  search: (keyword: string) =>
    api.get('/restaurants', { params: { search: keyword } }),
};

// Product APIs
export const productAPI = {
  getByRestaurant: (restaurantId: string) =>
    api.get('/products', { params: { restaurantId } }),
  
  getById: (id: string) =>
    api.get(`/products/${id}`),
  
  search: (keyword: string, restaurantId?: string) =>
    api.get('/products', { params: { search: keyword, restaurantId } }),
};

// Order APIs
export const orderAPI = {
  create: (orderData: any) =>
    api.post('/orders', orderData),
  
  getMyOrders: () =>
    api.get('/orders'),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  cancel: (id: string, reason: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),
  
  track: (id: string) =>
    api.get(`/orders/${id}/track`),
  
  confirmDelivery: (id: string) =>
    api.put(`/orders/${id}/confirm-delivery`),
  
  complete: (id: string) =>
    api.patch(`/orders/${id}/complete`),
};

// Voucher APIs
export const voucherAPI = {
  getAll: () =>
    api.get('/vouchers'),
  
  getById: (id: string) =>
    api.get(`/vouchers/${id}`),
  
  apply: (code: string, orderTotal: number, restaurantId?: string) =>
    api.post('/vouchers/apply', { code, orderTotal, restaurantId }),
};

// Drone APIs
export const droneAPI = {
  getAll: () =>
    api.get('/drones'),
  
  getByRestaurant: (restaurantId: string) =>
    api.get(`/drones/restaurant/${restaurantId}`),
  
  getById: (id: string) =>
    api.get(`/drones/${id}`),
};

// Review APIs
export const reviewAPI = {
  getAll: (params?: any) => api.get('/reviews', { params }),
  getSummary: (params?: any) => api.get('/reviews/summary', { params }),
  create: (payload: any) => api.post('/reviews', payload),
  reply: (id: string, payload: { comment: string }) =>
    api.post(`/reviews/${id}/reply`, payload),
};

export const paymentAPI = {
  confirmThirdParty: async (payload: { orderId: string; sessionId: string; status: 'success' | 'failed' }) => {
    console.log('[paymentAPI] confirmThirdParty payload:', payload);
    try {
      const response = await api.post('/orders/confirm-payment', payload);
      console.log('[paymentAPI] confirmThirdParty response:', response);
      return response;
    } catch (error: any) {
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
  createOrder: async (payload: { amount: number; orderId: string; description?: string }) => {
    console.log('[paypalAPI] createOrder payload:', payload);
    try {
      const response = await api.post('/paypal/create-order', payload);
      console.log('[paypalAPI] createOrder response:', response);
      return response;
    } catch (error: any) {
      console.error('[paypalAPI] createOrder error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  captureOrder: async (payload: { paypalOrderId: string; orderId: string }) => {
    console.log('[paypalAPI] captureOrder payload:', payload);
    try {
      const response = await api.post('/paypal/capture-order', payload);
      console.log('[paypalAPI] captureOrder response:', response);
      return response;
    } catch (error: any) {
      console.error('[paypalAPI] captureOrder error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: JSON.stringify(error),
      });
      // Nếu đã capture rồi, coi như thành công
      if (error.response?.data?.error?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
        return {
          success: true,
          data: { status: 'COMPLETED', alreadyCaptured: true }
        };
      }
      throw error;
    }
  },
};

// Notification APIs
export const notificationAPI = {
  getAll: () =>
    api.get('/notifications'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/mark-all-read'),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  upsert: (payload: any) => api.put('/cart', payload),
  clear: () => api.delete('/cart'),
};

// Saved Orders APIs
export const savedOrderAPI = {
  getAll: (params?: any) => api.get('/saved-orders', { params }),
  create: (payload: any) => api.post('/saved-orders', payload),
  update: (id: string, payload: any) => api.put(`/saved-orders/${id}`, payload),
  delete: (id: string) => api.delete(`/saved-orders/${id}`),
  orderFrom: (id: string) => api.post(`/saved-orders/${id}/order`),
};

export default api;
