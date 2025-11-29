import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/UserManagement/UserManagement";
import RestaurantManagement from "./pages/RestaurantManagement/RestaurantManagement";
import StaffManagement from "./pages/StaffManagement/StaffManagement";
import DroneManagement from "./pages/DroneManagement/DroneManagement";
import OrderManagement from "./pages/OrderManagement/OrderManagement";
import TransactionManagement from "./pages/TransactionManagement/TransactionManagement";
import AccountSettings from "./pages/AccountSettings/AccountSettings";
import Statistics from "./pages/Statistics/Statistics";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="restaurants" element={<RestaurantManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="drones" element={<DroneManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="transactions" element={<TransactionManagement />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}

export default App;
