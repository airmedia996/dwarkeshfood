import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { formatPriceShort } from '../utils/currency'

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getOrders()
        setOrders(response.data)
      } catch (error) {
        console.error('Failed to fetch orders')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-600 text-white'
      case 'out_for_delivery':
        return 'bg-blue-600 text-white'
      case 'preparing':
        return 'bg-orange-600 text-white'
      case 'confirmed':
        return 'bg-yellow-600 text-black'
      case 'cancelled':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return '✓'
      case 'out_for_delivery':
        return '🚗'
      case 'preparing':
        return '👨‍🍳'
      case 'confirmed':
        return '📋'
      case 'cancelled':
        return '✕'
      default:
        return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gold hover:text-yellow-500 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-5xl font-bold text-gold mb-2">📦 My Orders</h1>
          <p className="text-gray-400">View and track your order history</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-gray-400 py-12"
          >
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
              <p>Loading your orders...</p>
            </div>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🍽️</p>
            <h2 className="text-2xl font-bold text-white mb-4">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">Start ordering delicious meals from our menu!</p>
            <Link
              to="/menu"
              className="inline-block px-8 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Browse Menu
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 mb-6"
            >
              You have <span className="text-gold font-bold">{orders.length}</span> order
              {orders.length !== 1 ? 's' : ''}
            </motion.div>

            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-coffee border border-coffee rounded-lg p-6 hover:border-gold transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-white font-bold text-lg">
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ').toUpperCase()}
                        </motion.span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="text-white font-semibold">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Items</p>
                          <p className="text-white font-semibold">{order.items?.length || 0} items</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Payment</p>
                          <p className="text-white font-semibold capitalize">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total</p>
                          <p className="text-gold font-bold text-lg">{formatPriceShort(order.totalAmount)}</p>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="text-xs text-gray-400 mb-3">
                        <p>📍 {order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={`/order/${order.id}/tracking`}
                        className="inline-block px-6 py-2 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                      >
                        Track Order →
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
