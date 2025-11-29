import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, setUser } from "./store/slices/authSlice";
import { fetchCart } from "./store/slices/cartSlice";
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
import PayPalPayment from "./pages/PayPalPayment/PayPalPayment";
import Profile from "./pages/Profile/Profile";
import Review from "./pages/Review/Review";
import EditProfile from "./pages/EditProfile/EditProfile";
import Orders from "./pages/Orders/Orders";
import Notifications from "./pages/Notifications/Notifications";
import Vouchers from "./pages/Vouchers/Vouchers";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("🚀 App mounted, isAuthenticated:", isAuthenticated);

    // Restore auth state from localStorage on app startup
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch(setUser(user));
          
          // Load fresh user data and cart from server
          try {
            await dispatch(loadUser()).unwrap();
            await dispatch(fetchCart()).unwrap();
          } catch (error) {
            console.error('Failed to load user data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

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
        <Route path="payment-return/:provider" element={<PaymentReturn />} />
        <Route
          path="paypal-payment/:orderId"
          element={
            <PrivateRoute>
              <PayPalPayment />
            </PrivateRoute>
          }
        />
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
        <Route
          path="notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="vouchers"
          element={
            <PrivateRoute>
              <Vouchers />
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
