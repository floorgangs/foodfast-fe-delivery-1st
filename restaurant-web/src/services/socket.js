import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
      console.log('✅ Socket connected:', socket.id);
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

// Join restaurant room for real-time updates
export const joinRestaurantRoom = (restaurantId) => {
  const socket = getSocket();
  socket.emit('join_room', { restaurantId, role: 'restaurant' });
};

// Listen for new orders
export const onNewOrder = (callback) => {
  const socket = getSocket();
  socket.on('new_order', callback);
};

// Listen for order updates
export const onOrderUpdate = (callback) => {
  const socket = getSocket();
  socket.on('order_updated', callback);
};

// Listen for order cancellations
export const onOrderCancelled = (callback) => {
  const socket = getSocket();
  socket.on('order_cancelled', callback);
};

// Remove listeners
export const offNewOrder = () => {
  const socket = getSocket();
  socket.off('new_order');
};

export const offOrderUpdate = () => {
  const socket = getSocket();
  socket.off('order_updated');
};

export const offOrderCancelled = () => {
  const socket = getSocket();
  socket.off('order_cancelled');
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinRestaurantRoom,
  onNewOrder,
  onOrderUpdate,
  onOrderCancelled,
  offNewOrder,
  offOrderUpdate,
  offOrderCancelled,
};
