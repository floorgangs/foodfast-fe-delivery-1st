import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'confirmed' | 'preparing' | 'delivering' | 'delivered';
  createdAt: string;
  deliveryAddress: string;
  pickupCoordinate?: Coordinate;
  dropoffCoordinate?: Coordinate;
  unlockPin?: string;
  isReviewed?: boolean;
  rating?: number | null;
  reviewComment?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder: (
      state,
      action: PayloadAction<Omit<Order, 'id' | 'status' | 'createdAt' | 'isReviewed' | 'rating' | 'reviewComment'>>
    ) => {
      const newOrder: Order = {
        ...action.payload,
        id: `ORD${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        isReviewed: false,
        rating: null,
        reviewComment: '',
      };
      state.orders.unshift(newOrder);
      state.currentOrder = newOrder;
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.status = action.payload.status;
      }
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    submitOrderReview: (
      state,
      action: PayloadAction<{ id: string; rating: number; comment?: string }>
    ) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.isReviewed = true;
        order.rating = action.payload.rating;
        order.reviewComment = action.payload.comment ?? '';
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.isReviewed = true;
        state.currentOrder.rating = action.payload.rating;
        state.currentOrder.reviewComment = action.payload.comment ?? '';
      }
    },
  },
});

export const { createOrder, updateOrderStatus, setCurrentOrder, submitOrderReview } = orderSlice.actions;
export default orderSlice.reducer;
