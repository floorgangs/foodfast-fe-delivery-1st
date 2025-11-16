import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/UserManagement/UserManagement";
import RestaurantManagement from "./pages/RestaurantManagement/RestaurantManagement";
import StaffManagement from "./pages/StaffManagement/StaffManagement";
import DroneManagement from "./pages/DroneManagement/DroneManagement";
import OrderManagement from "./pages/OrderManagement/OrderManagement";
import Statistics from "./pages/Statistics/Statistics";
import "./App.css";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

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
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}

export default App;
