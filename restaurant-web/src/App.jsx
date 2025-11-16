import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import RestaurantHub from './pages/RestaurantHub/RestaurantHub'
import Dashboard from './pages/Dashboard/Dashboard'
import MenuManagement from './pages/MenuManagement/MenuManagement'
import OrderManagement from './pages/OrderManagement/OrderManagement'
import Statistics from './pages/Statistics/Statistics'
import Promotions from './pages/Promotions/Promotions'
import Reviews from './pages/Reviews/Reviews'
import AccountSettings from './pages/AccountSettings/AccountSettings'
import Drones from './pages/Drones/Drones'
import Staff from './pages/Staff/Staff'
import './App.css'

function App() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/restaurant-hub" element={isAuthenticated ? <RestaurantHub /> : <Navigate to="/login" />} />
      <Route path="/account-settings" element={isAuthenticated ? <AccountSettings /> : <Navigate to="/login" />} />
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="drones" element={<Drones />} />
        <Route path="staff" element={<Staff />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  )
}

export default App
