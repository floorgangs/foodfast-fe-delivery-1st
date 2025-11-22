import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Thay YOUR_IP bằng IP máy tính chạy backend
// Windows: Chạy ipconfig trong CMD để xem IPv4 Address
// Mac/Linux: Chạy ifconfig để xem IP
const API_URL = __DEV__ 
  ? 'http://192.168.1.140:5000/api' // IP máy tính đang chạy backend
  : 'https://your-production-api.com/api';

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
  confirmThirdParty: (payload: { orderId: string; sessionId: string; status: 'success' | 'failed' }) =>
    api.post('/orders/confirm-payment', payload),
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

export default api;
