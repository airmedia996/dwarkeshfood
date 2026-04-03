import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/index'
import { logout } from '../store/slices/authSlice'
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, addNotification } from '../store/slices/notificationSlice'
import { io } from 'socket.io-client'
import ChatSupport from './ChatSupport'
import WhatsAppButton from './WhatsAppButton'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications())
      dispatch(fetchUnreadCount())
    }
  }, [token, dispatch])

  useEffect(() => {
    if (!token || !user) return
    if (socketRef.current) return

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
    })

    socketRef.current.emit('join-user', user.id)

    socketRef.current.on('notification', (notification: any) => {
      dispatch(addNotification(notification))
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [token, user, dispatch])

  const handleLogout = () => {
    dispatch(logout() as any)
    navigate('/')
  }

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return '📋'
      case 'order_confirmed': return '✅'
      case 'preparing': return '👨‍🍳'
      case 'ready_for_pickup': return '🍽️'
      case 'out_for_delivery': return '🚗'
      case 'delivered': return '🎉'
      case 'cancelled': return '❌'
      case 'payment_received': return '💰'
      case 'payment_failed': return '⚠️'
      default: return '🔔'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-black border-b-2 border-coffee sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gold">🍽️</div>
              <span className="text-xl font-bold text-gold hidden sm:inline">
                DWARKESH FOOD
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/menu"
                className="text-white hover:text-gold transition-colors"
              >
                Menu
              </Link>
              {token && (
                <>
                  <Link
                    to="/orders"
                    className="text-white hover:text-gold transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white hover:text-gold transition-colors"
                  >
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-white hover:text-gold transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              {token && (
                <Link
                  to="/cart"
                  className="relative text-white hover:text-gold transition-colors"
                >
                  <span className="text-2xl">🛒</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              {token && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative text-white hover:text-gold transition-colors"
                  >
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-dark-coffee border border-coffee rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-coffee flex justify-between items-center">
                        <h3 className="text-gold font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-gray-400 hover:text-gold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto max-h-80">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b border-coffee hover:bg-black/30 cursor-pointer ${
                                !notification.isRead ? 'bg-black/50' : ''
                              }`}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-400 text-xs truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-gold rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth */}
              {!token ? (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gold border border-gold rounded hover:bg-gold hover:text-black transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gold text-black rounded hover:bg-yellow-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gold border border-gold rounded hover:bg-gold hover:text-black transition-colors"
                >
                  Logout
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden text-gold text-2xl"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <Link
                to="/menu"
                className="block text-white hover:text-gold py-2"
                onClick={() => setMenuOpen(false)}
              >
                Menu
              </Link>
              {token && (
                <>
                  <Link
                    to="/orders"
                    className="block text-white hover:text-gold py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-white hover:text-gold py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block text-white hover:text-gold py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
        
        {/* Chat Support */}
        <ChatSupport />
        <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-dark-coffee border-t border-coffee mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-gold font-bold mb-4">DWARKESH FOOD</h3>
              <p className="text-gray-400">
                Authentic Indian food delivered to your doorstep.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-gold font-bold mb-4">Contact</h3>
              <p className="text-gray-400">
                📞 0571679999
                <br />
                💬 WhatsApp: 0571679999
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-gold font-bold mb-4">Hours</h3>
              <p className="text-gray-400">
                Mon-Sun: 11:00 AM - 11:00 PM
                <br />
                Open Daily
              </p>
            </div>
          </div>

          <div className="border-t border-coffee pt-8 text-center text-gray-400">
            <p>&copy; 2024 DWARKESH FOOD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
