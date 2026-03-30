import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/index'
import { logout } from '../store/slices/authSlice'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout() as any)
    navigate('/')
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
                Closed on Mondays
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
