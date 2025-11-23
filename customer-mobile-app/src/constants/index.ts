// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'momo', name: 'Ví MoMo', icon: 'Ⓜ' },
  { id: 'vnpay', name: 'VNPay', icon: 'Ⓥ' },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  ready: 'Sẵn sàng',
  delivering: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const ORDER_STATUS_COLORS = {
  pending: '#FFA500',
  confirmed: '#4CAF50',
  ready: '#9C27B0',
  delivering: '#FF5722',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

// Default delivery address (if user hasn't set)
export const DEFAULT_ADDRESS = {
  id: 'default',
  name: 'Địa chỉ mặc định',
  address: 'Vui lòng cập nhật địa chỉ giao hàng trong Hồ sơ',
  city: 'TP.HCM',
  district: 'Quận 1',
  ward: 'Phường 1',
  phone: '',
};
