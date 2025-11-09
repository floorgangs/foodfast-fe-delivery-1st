import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'
import RestaurantDetail from './pages/RestaurantDetail/RestaurantDetail'
import Cart from './pages/Cart/Cart'
import OrderTracking from './pages/OrderTracking/OrderTracking'
import Profile from './pages/Profile/Profile'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order/:orderId" element={<OrderTracking />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App
