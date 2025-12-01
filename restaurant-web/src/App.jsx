import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import MenuManagement from "./pages/MenuManagement/MenuManagement";
import OrderManagement from "./pages/OrderManagement/OrderManagement";
import Analytics from "./pages/Analytics/Analytics";
import Promotions from "./pages/Promotions/Promotions";
import Reviews from "./pages/Reviews/Reviews";
import AccountSettings from "./pages/AccountSettings/AccountSettings";
import Drones from "./pages/Drones/Drones";
import Staff from "./pages/Staff/Staff";
import PartnerHub from "./pages/PartnerHub/PartnerHub";
import Onboarding from "./pages/Onboarding/Onboarding";
import RestaurantHub from "./pages/RestaurantHub/RestaurantHub";
import RestaurantSelection from "./pages/RestaurantSelection/RestaurantSelection";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, restaurant } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we have auth data in localStorage
    const token = localStorage.getItem("restaurant_token");
    const userStr = localStorage.getItem("restaurant_user");

    if (token && userStr) {
      // We have saved auth, dispatch checkAuth
      dispatch(checkAuth());
    }

    // Mark as initialized after a tick to allow Redux to update
    setTimeout(() => setIsInitialized(true), 0);
  }, [dispatch]);

  // Show nothing until initialized to prevent flash of redirect
  if (!isInitialized) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Sau khi login, chuyển đến trang chọn nhà hàng */}
      <Route
        path="/select-restaurant"
        element={
          isAuthenticated ? <RestaurantSelection /> : <Navigate to="/login" />
        }
      />

      <Route
        path="/partner-hub"
        element={isAuthenticated ? <PartnerHub /> : <Navigate to="/login" />}
      />
      <Route
        path="/onboarding"
        element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />}
      />
      <Route
        path="/restaurant-hub"
        element={isAuthenticated ? <RestaurantHub /> : <Navigate to="/login" />}
      />
      <Route
        path="/account-settings"
        element={
          isAuthenticated ? <AccountSettings /> : <Navigate to="/login" />
        }
      />

      {/* Dashboard chỉ truy cập được khi đã chọn nhà hàng */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            restaurant ? (
              <Layout />
            ) : (
              <Navigate to="/select-restaurant" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="drones" element={<Drones />} />
        <Route path="staff" element={<Staff />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
