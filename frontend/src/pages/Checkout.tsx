import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { RootState } from '../store/index'
import { clearCart } from '../store/slices/cartSlice'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import { formatPriceShort } from '../utils/currency'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, subtotal, tax, deliveryFee, totalAmount } = useSelector(
    (state: RootState) => state.cart
  )
  const { user } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState({
    address: '',
    paymentMethod: 'cash',
    specialInstructions: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        deliveryAddress: formData.address,
        paymentMethod: formData.paymentMethod === 'card' ? 'stripe' : formData.paymentMethod,
        specialInstructions: formData.specialInstructions,
      }
      const response = await ordersAPI.createOrder(orderData)
      dispatch(clearCart())
      navigate(`/order/${response.data.id}/tracking`)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Order failed')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-5xl font-bold text-gold mb-2">🛍️ Checkout</h1>
          <p className="text-gray-400">Complete your order and enjoy delicious food!</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            {/* Delivery Address */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <label className="block text-white font-bold mb-3 text-lg">
                📍 Delivery Address
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your complete delivery address"
                className="w-full px-4 py-3 bg-black border border-coffee rounded text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50 transition-colors"
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <label className="block text-white font-bold mb-4 text-lg">
                💳 Payment Method
              </label>
              <div className="space-y-3">
                {[
                  { value: 'cash', label: '💵 Cash on Delivery', icon: '💵' },
                  { value: 'stripe', label: '💳 Stripe Card', icon: '💳' },
                  { value: 'momo', label: '📱 Mobile Money (Momo)', icon: '📱' },
                ].map((option) => (
                  <motion.label
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.paymentMethod === option.value
                        ? 'border-gold bg-gold bg-opacity-10'
                        : 'border-coffee hover:border-gold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={formData.paymentMethod === option.value}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-white font-semibold ml-3">{option.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <label className="block text-white font-bold mb-3 text-lg">
                📝 Special Instructions (Optional)
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                placeholder="E.g., No onions, Extra spicy, etc."
                className="w-full px-4 py-3 bg-black border border-coffee rounded text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50 transition-colors"
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '⏳ Processing Order...' : '✓ Place Order'}
            </motion.button>
          </motion.form>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gold mb-6">📋 Order Summary</h2>

              {/* Order Items */}
              <div className="mb-6 max-h-64 overflow-y-auto">
                <h3 className="text-white font-semibold mb-3">Items ({items.length}):</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between text-gray-300 text-sm"
                    >
                      <span>
                        {item.name} <span className="text-gold">×{item.quantity}</span>
                      </span>
                      <span className="text-gold">{formatPriceShort(item.price * item.quantity)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 border-t border-b border-coffee py-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPriceShort(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (5%)</span>
                  <span>{formatPriceShort(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-400 font-bold' : ''}>
                    {deliveryFee === 0 ? '✓ FREE' : formatPriceShort(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-gold to-coffee rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-black font-bold text-lg">Total Amount</span>
                  <span className="text-black font-bold text-2xl">{formatPriceShort(totalAmount)}</span>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-black bg-opacity-50 rounded-lg p-4 text-sm text-gray-300">
                <p className="mb-1">
                  <span className="text-gold">👤 Name:</span> {user?.name}
                </p>
                <p className="mb-1">
                  <span className="text-gold">📧 Email:</span> {user?.email}
                </p>
                <p>
                  <span className="text-gold">📱 Phone:</span> {user?.phone}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
