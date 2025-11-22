import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
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
import PaymentReturn from "./pages/PaymentReturn/PaymentReturn";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/Review/Review";
import EditProfile from "./pages/EditProfile/EditProfile";
import Orders from "./pages/Orders/Orders";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("🚀 App mounted, isAuthenticated:", isAuthenticated);

    // Restore auth state from localStorage on app startup
    dispatch(checkAuth());
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

      {/* Layout routes - Không cần đăng nhập để xem */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />

        {/* Chỉ các route này mới cần đăng nhập */}
        <Route
          path="checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="order-tracking/:orderId"
          element={
            <PrivateRoute>
              <OrderTracking />
            </PrivateRoute>
          }
        />
        <Route
          path="payment"
          element={
            <PrivateRoute>
              <PaymentGateway />
            </PrivateRoute>
          }
        />
        <Route path="payment/vnpay-return" element={<PaymentReturn />} />
        <Route path="payment/momo-return" element={<PaymentReturn />} />
        <Route
          path="review/:orderId"
          element={
            <PrivateRoute>
              <Review />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Redirect to home for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
