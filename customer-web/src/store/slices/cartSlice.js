import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    restaurantId: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, restaurantId } = action.payload
      
      // Nếu đổi nhà hàng, clear giỏ hàng
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = []
      }
      
      state.restaurantId = restaurantId
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...product, quantity: 1 })
      }
      
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.id === productId)
      
      if (item) {
        item.quantity = quantity
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== productId)
        }
      }
      
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      if (state.items.length === 0) {
        state.restaurantId = null
      }
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.restaurantId = null
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
