import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import UserManagement from './pages/UserManagement/UserManagement'
import RestaurantManagement from './pages/RestaurantManagement/RestaurantManagement'
import OrderMonitoring from './pages/OrderMonitoring/OrderMonitoring'
import DroneManagement from './pages/DroneManagement/DroneManagement'
import './App.css'

function App() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="restaurants" element={<RestaurantManagement />} />
        <Route path="orders" element={<OrderMonitoring />} />
        <Route path="drones" element={<DroneManagement />} />
      </Route>
    </Routes>
  )
}

export default App
