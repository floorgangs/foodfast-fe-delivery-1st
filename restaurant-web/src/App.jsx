import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import MenuManagement from './pages/MenuManagement/MenuManagement'
import OrderManagement from './pages/OrderManagement/OrderManagement'
import Statistics from './pages/Statistics/Statistics'
import './App.css'

function App() {
  const { isAuthenticated } = useSelector(state => state.auth)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  )
}

export default App
