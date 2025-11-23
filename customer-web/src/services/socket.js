import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

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
export const joinCustomerRoom = (customerId) => {
  const socket = getSocket();
  socket.emit('join_room', { userId: customerId, role: 'customer' });
};

// Listen for order status updates
export const onOrderStatusUpdate = (callback) => {
  const socket = getSocket();
  socket.on('order_status_updated', callback);
};

// Listen for drone location updates
export const onDroneLocationUpdate = (callback) => {
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
