import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    stats: {
      today: 0,
      pending: 0,
      completed: 0,
      revenue: 0,
    },
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    updateStats: (state, action) => {
      state.stats = action.payload
    },
  },
})

export const { setOrders, updateOrderStatus, updateStats } = orderSlice.actions
export default orderSlice.reducer
