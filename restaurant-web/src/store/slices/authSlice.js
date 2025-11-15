import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    restaurant: null,
    isAuthenticated: false,
    token: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user
      state.restaurant = action.payload.restaurant || null
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('restaurant_token', action.payload.token)
      localStorage.setItem('restaurant_data', JSON.stringify(action.payload.restaurant || null))
    },
    logout: (state) => {
      state.user = null
      state.restaurant = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('restaurant_token')
      localStorage.removeItem('restaurant_data')
      localStorage.removeItem('foodfastLastRestaurantId')
    },
    checkAuth: (state) => {
      const token = localStorage.getItem('restaurant_token')
      const restaurant = localStorage.getItem('restaurant_data')
      if (token && restaurant) {
        state.token = token
        state.restaurant = restaurant === 'null' ? null : JSON.parse(restaurant)
        state.isAuthenticated = true
      }
    },
    setRestaurant: (state, action) => {
      state.restaurant = action.payload || null
      if (action.payload) {
        localStorage.setItem('restaurant_data', JSON.stringify(action.payload))
        localStorage.setItem('foodfastLastRestaurantId', action.payload.id)
      } else {
        localStorage.removeItem('restaurant_data')
        localStorage.removeItem('foodfastLastRestaurantId')
      }
    },
  },
})

export const { login, logout, checkAuth, setRestaurant } = authSlice.actions
export default authSlice.reducer
