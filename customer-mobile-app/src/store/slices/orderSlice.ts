import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'confirmed' | 'preparing' | 'delivering' | 'delivered';
  createdAt: string;
  deliveryAddress: string;
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
    createOrder: (state, action: PayloadAction<Omit<Order, 'id' | 'status' | 'createdAt'>>) => {
      const newOrder: Order = {
        ...action.payload,
        id: `ORD${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
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
  },
});

export const { createOrder, updateOrderStatus, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
