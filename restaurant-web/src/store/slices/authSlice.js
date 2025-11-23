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

      // Check if token is mock token and clear it
      if (
        token === "mock-restaurant-token" ||
        (token && token.startsWith("mock-"))
      ) {
        console.log("🧹 Detected old mock token, clearing localStorage...");
        localStorage.removeItem("restaurant_token");
        localStorage.removeItem("restaurant_user");
        localStorage.removeItem("restaurant_data");
        localStorage.removeItem("foodfastLastRestaurantId");
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.restaurant = null;
        console.log("✅ Old mock data cleared, please login again");
        return;
      }

      if (token && userStr) {
        try {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.restaurant =
            restaurantStr && restaurantStr !== "null"
              ? JSON.parse(restaurantStr)
              : null;
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
        const restaurantId = action.payload._id || action.payload.id || "";
        localStorage.setItem("foodfastLastRestaurantId", restaurantId);
      } else {
        localStorage.removeItem("restaurant_data");
        localStorage.removeItem("foodfastLastRestaurantId");
      }
    },
    clearRestaurant: (state) => {
      state.restaurant = null;
      localStorage.removeItem("restaurant_data");
      localStorage.removeItem("foodfastLastRestaurantId");
    },
  },
});

export const { login, logout, checkAuth, setRestaurant, clearRestaurant } = authSlice.actions;
export default authSlice.reducer;
