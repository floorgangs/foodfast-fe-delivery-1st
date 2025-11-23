import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        ...action.payload,
        id: `ORD${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        isReviewed: false,
        rating: null,
        reviewComment: '',
      };
      state.orders.unshift(newOrder);
      state.currentOrder = newOrder;
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder.status = action.payload.status;
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    submitOrderReview: (state, action) => {
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
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
});

export const { createOrder, updateOrderStatus, setCurrentOrder, submitOrderReview, setOrders } = orderSlice.actions;
export default orderSlice.reducer;
