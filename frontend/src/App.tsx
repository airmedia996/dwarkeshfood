import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store/index'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import AdminDashboard from './pages/admin/AdminDashboard'
import Profile from './pages/Profile'

function App() {
  const { token, user } = useSelector((state: RootState) => state.auth)

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/menu" element={<Layout><Menu /></Layout>} />

        {/* Protected routes */}
        {token && (
          <>
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/orders" element={<Layout><Orders /></Layout>} />
            <Route path="/order/:id/tracking" element={<Layout><OrderTracking /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </>
        )}

        {/* Admin routes */}
        {token && user?.role === 'admin' && (
          <Route path="/admin/*" element={<AdminDashboard />} />
        )}

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
