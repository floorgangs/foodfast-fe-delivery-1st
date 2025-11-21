import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    restaurant: null,
    isAuthenticated: false,
    token: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.restaurant = action.payload.restaurant || null;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("restaurant_token", action.payload.token);
      localStorage.setItem(
        "restaurant_user",
        JSON.stringify(action.payload.user)
      );
      localStorage.setItem(
        "restaurant_data",
        JSON.stringify(action.payload.restaurant || null)
      );
    },
    logout: (state) => {
      state.user = null;
      state.restaurant = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("restaurant_token");
      localStorage.removeItem("restaurant_user");
      localStorage.removeItem("restaurant_data");
      localStorage.removeItem("foodfastLastRestaurantId");
    },
    checkAuth: (state) => {
      console.log("=== authSlice.checkAuth called ===");
      const token = localStorage.getItem("restaurant_token");
      const userStr = localStorage.getItem("restaurant_user");
      const restaurantStr = localStorage.getItem("restaurant_data");

      console.log("Token:", token);
      console.log("User string:", userStr);
      console.log("Restaurant string:", restaurantStr);

      if (token && userStr && restaurantStr) {
        try {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.restaurant =
            restaurantStr === "null" ? null : JSON.parse(restaurantStr);
          state.isAuthenticated = true;
          console.log("✅ Auth restored successfully");
          console.log("User:", state.user);
          console.log("Restaurant:", state.restaurant);
        } catch (error) {
          console.error("❌ Error restoring auth state:", error);
          state.isAuthenticated = false;
        }
      } else {
        console.log("❌ Missing auth data in localStorage");
        console.log("Has token:", !!token);
        console.log("Has user:", !!userStr);
        console.log("Has restaurant:", !!restaurantStr);
      }
    },
    setRestaurant: (state, action) => {
      state.restaurant = action.payload || null;
      if (action.payload) {
        localStorage.setItem("restaurant_data", JSON.stringify(action.payload));
        localStorage.setItem("foodfastLastRestaurantId", action.payload.id);
      } else {
        localStorage.removeItem("restaurant_data");
        localStorage.removeItem("foodfastLastRestaurantId");
      }
    },
  },
});

export const { login, logout, checkAuth, setRestaurant } = authSlice.actions;
export default authSlice.reducer;
