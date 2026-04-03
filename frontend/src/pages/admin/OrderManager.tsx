import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ordersAPI, adminAPI } from '../../services/api'

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-600' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-yellow-600' },
    { value: 'preparing', label: 'Preparing', color: 'bg-orange-600' },
    { value: 'ready', label: 'Ready', color: 'bg-blue-600' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-600' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-600' },
  ]

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div>
      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            filterStatus === 'all'
              ? 'bg-gold text-black'
              : 'bg-coffee text-white hover:bg-gold hover:text-black'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilterStatus(status.value)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              filterStatus === status.value
                ? 'bg-gold text-black'
                : `${status.color} text-white hover:opacity-80`
            }`}
          >
            {status.label} ({orders.filter((o) => o.status === status.value).length})
          </button>
        ))}
      </motion.div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center text-gray-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No orders found</div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-bold">#{order.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="text-white font-bold">{order.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-gold font-bold">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Payment Method</p>
                    <p className="text-white font-bold capitalize">{order.paymentMethod}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Delivery Address</p>
                    <p className="text-white text-sm">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Items</p>
                    <p className="text-white text-sm">{order.items?.length || 0} items</p>
                  </div>
                </div>

                <div className="border-t border-coffee pt-4">
                  <p className="text-gray-400 text-sm mb-2">Current Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <motion.button
                        key={status.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.id, status.value)}
                        className={`px-4 py-2 rounded font-semibold text-sm transition-all ${
                          order.status === status.value
                            ? `${status.color} text-white ring-2 ring-white`
                            : `${status.color} text-white opacity-60 hover:opacity-100`
                        }`}
                      >
                        {status.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default OrderManager
