import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import { resumeAutoProgressions } from "./services/orderService";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import RestaurantDetail from "./pages/RestaurantDetail/RestaurantDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import OrderTracking from "./pages/OrderTracking/OrderTracking";
import PaymentGateway from "./pages/PaymentGateway/PaymentGateway";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/Review/Review";
import EditProfile from "./pages/EditProfile/EditProfile";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("🚀 App mounted, isAuthenticated:", isAuthenticated);

    // Restore auth state from localStorage on app startup
    dispatch(checkAuth());

    // Resume auto-progression for incomplete orders
    if (isAuthenticated) {
      try {
        resumeAutoProgressions();
      } catch (error) {
        console.error("Error resuming auto progressions:", error);
      }
    }
  }, [dispatch, isAuthenticated]);

  console.log("🎨 App rendering, isAuthenticated:", isAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Private routes - Cần đăng nhập */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="payment" element={<PaymentGateway />} />
        <Route path="review/:orderId" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
      </Route>

      {/* Redirect to login for unknown routes */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
