import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ordersAPI } from '../services/api'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { io } from 'socket.io-client'
import { formatPriceShort } from '../utils/currency'

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getOrder(id!)
        setOrder(response.data)

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        socket.emit('track-order', id)

        socket.on('order:updated', (data) => {
          setOrder((prev: any) => ({ ...prev, ...data }))
        })

        socket.on('delivery:location', (data) => {
          setCurrentLocation({ lat: data.latitude, lng: data.longitude })
        })

        return () => socket.close()
      } catch (error) {
        console.error('Failed to fetch order')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✓'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '📦'
      case 'out_for_delivery':
        return '🚗'
      case 'delivered':
        return '🎉'
      default:
        return '❓'
    }
  }

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: '📝' },
    { status: 'confirmed', label: 'Confirmed', icon: '✓' },
    { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { status: 'ready', label: 'Ready for Delivery', icon: '📦' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
    { status: 'delivered', label: 'Delivered', icon: '🎉' },
  ]

  const currentStatusIndex = statusSteps.findIndex((step) => step.status === order?.status)
  const isDelivered = order?.status === 'delivered'

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-black py-12 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center text-gray-400"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4 mx-auto"></div>
          <p>Loading order details...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gold hover:text-yellow-500 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-5xl font-bold text-gold mb-2">📍 Order Tracking</h1>
          <p className="text-gray-400">Order #{order.id.substring(0, 8).toUpperCase()}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gold mb-8">Order Status Timeline</h2>

              {/* Status Steps */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-coffee"></div>

                {/* Steps */}
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex

                    return (
                      <motion.div
                        key={step.status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-24"
                      >
                        {/* Circle Icon */}
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 ${
                            isCompleted
                              ? 'bg-gold border-gold text-black'
                              : 'bg-black border-coffee text-gray-400'
                          }`}
                        >
                          {step.icon}
                        </motion.div>

                        {/* Content */}
                        <div className={isCurrent ? 'bg-gold bg-opacity-10 p-4 rounded border border-gold' : ''}>
                          <h3 className={`font-bold text-lg ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                            {step.label}
                          </h3>
                          {isCurrent && <p className="text-gold text-sm mt-2">🔄 In Progress...</p>}
                          {isCompleted && index < currentStatusIndex && (
                            <p className="text-green-400 text-sm mt-2">✓ Completed</p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Live Location Map */}
            {order.status === 'out_for_delivery' && currentLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-6 mt-6"
              >
                <h3 className="text-xl font-bold text-gold mb-4">🚗 Delivery Location</h3>
                <div className="bg-black rounded-lg p-4 h-64 flex items-center justify-center">
                  {/* Simple coordinate display */}
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">Delivery Agent Location</p>
                    <p className="text-white font-bold text-2xl">
                      📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                    <p className="text-gray-400 text-xs mt-4">
                      On the way to your location... {Math.floor(Math.random() * 10 + 5)} mins away
                    </p>
                    {/* Animated direction indicator */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="text-3xl mt-4"
                    >
                      🧭
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className={`rounded-lg p-6 ${isDelivered ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-orange-600 to-orange-800'}`}>
              <p className="text-white text-sm uppercase mb-2">Current Status</p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-bold text-white"
              >
                {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ')}
              </motion.p>
              {!isDelivered && order.estimatedDeliveryTime && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white text-xs opacity-80">Estimated Delivery</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-white text-xs opacity-70 mt-1">
                    {Math.max(0, Math.ceil((new Date(order.estimatedDeliveryTime).getTime() - Date.now()) / 60000))} mins remaining
                  </p>
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold mb-4">📋 Order Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Order ID</p>
                  <p className="text-white font-semibold">#{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Items</p>
                  <p className="text-white font-semibold">{order.items?.length || 0} items</p>
                </div>
                <div className="border-t border-coffee pt-3">
                  <p className="text-gray-400">Delivery Address</p>
                  <p className="text-white font-semibold">📍 {order.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold mb-4">💳 Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Method</p>
                  <p className="text-white font-semibold capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="text-gold font-bold text-xl">{formatPriceShort(order.totalAmount)}</p>
                </div>
                <div className="border-t border-coffee pt-3">
                  <p className="text-gray-400">Status</p>
                  <p className={`font-semibold ${order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.paymentStatus === 'completed' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Order */}
            {['pending', 'confirmed'].includes(order.status) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-coffee border border-red-800 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-red-400 mb-4">❌ Cancel Order</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Orders can be cancelled while in pending or confirmed status.
                </p>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to cancel this order?')) return
                    try {
                      const response = await ordersAPI.cancelOrder(order.id)
                      setOrder(response.data)
                      alert(response.data.refundMessage || 'Order cancelled')
                    } catch (error) {
                      console.error('Failed to cancel order')
                    }
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              </motion.div>
            )}

            {/* Support */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-lg font-bold text-gold mb-4">📞 Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Contact us for any issues with your order
              </p>
              <a
                href="tel:0571679999"
                className="block w-full text-center bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 transition-colors"
              >
                Call Support
              </a>
            </div>

            {/* Reorder Button */}
            {order.status === 'delivered' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-gold mb-4">🔄 Order Again</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Reorder the same items from this order
                </p>
                <button
                  onClick={() => {
                    order.items.forEach((item: any) => {
                      dispatch(addToCart({
                        menuItemId: item.menuItemId,
                        name: item.menuItem?.name || 'Item',
                        price: item.price,
                        image: item.menuItem?.image || '',
                        quantity: item.quantity
                      }))
                    })
                    navigate('/cart')
                  }}
                  className="w-full bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 transition-colors"
                >
                  Add to Cart
                </button>
              </motion.div>
            )}

            {/* Rate Order */}
            {order.status === 'delivered' && !order.rating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-gold mb-4">⭐ Rate Your Order</h3>
                {!showRating ? (
                  <button
                    onClick={() => setShowRating(true)}
                    className="w-full bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 transition-colors"
                  >
                    Leave a Review
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-3xl transition-transform hover:scale-110"
                        >
                          {star <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full bg-black text-white border border-coffee rounded p-3 text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowRating(false)
                          setRating(0)
                          setReview('')
                        }}
                        className="flex-1 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (rating === 0) return
                          setIsSubmitting(true)
                          try {
                            await ordersAPI.rateOrder(order.id, { rating, review })
                            setOrder((prev: any) => ({ ...prev, rating, review }))
                            setShowRating(false)
                          } catch (error) {
                            console.error('Failed to submit rating')
                          } finally {
                            setIsSubmitting(false)
                          }
                        }}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1 bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Show existing rating */}
            {order.status === 'delivered' && order.rating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-gold mb-4">⭐ Your Rating</h3>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl">
                      {star <= order.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                {order.review && (
                  <p className="text-gray-300 text-sm italic">"{order.review}"</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
