import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
  },
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        id: Date.now().toString(),
        ...action.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      state.orders.unshift(newOrder)
      state.currentOrder = newOrder
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = status
        }
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
  },
})

export const { createOrder, updateOrderStatus, setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
