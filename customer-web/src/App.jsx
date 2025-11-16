import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";
import { resumeAutoProgressions } from "./services/orderService";
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

  useEffect(() => {
    // Restore auth state from localStorage on app startup
    dispatch(checkAuth());

    // Resume auto-progression for incomplete orders
    resumeAutoProgressions();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment" element={<PaymentGateway />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="review/:orderId" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
