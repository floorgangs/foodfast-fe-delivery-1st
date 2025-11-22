import { io, Socket } from 'socket.io-client';

// IMPORTANT: Thay YOUR_IP bằng IP máy tính chạy backend (giống với api.ts)
const SOCKET_URL = __DEV__ 
  ? 'http://172.24.176.1:5000' // IP máy tính đang chạy backend
  : 'https://your-production-api.com';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join customer room for real-time updates
export const joinCustomerRoom = (customerId: string) => {
  const socket = getSocket();
  socket.emit('join_room', { userId: customerId, role: 'customer' });
};

// Listen for order status updates
export const onOrderStatusUpdate = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket.on('order_status_updated', callback);
};

// Listen for drone location updates
export const onDroneLocationUpdate = (callback: (data: any) => void) => {
  const socket = getSocket();
  socket.on('drone_location_updated', callback);
};

// Remove listeners
export const offOrderStatusUpdate = () => {
  const socket = getSocket();
  socket.off('order_status_updated');
};

export const offDroneLocationUpdate = () => {
  const socket = getSocket();
  socket.off('drone_location_updated');
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinCustomerRoom,
  onOrderStatusUpdate,
  onDroneLocationUpdate,
  offOrderStatusUpdate,
  offDroneLocationUpdate,
};
