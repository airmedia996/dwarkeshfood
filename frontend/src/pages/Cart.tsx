import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/index'
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPriceShort } from '../utils/currency'

const Cart: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal, tax, deliveryFee, totalAmount } = useSelector(
    (state: RootState) => state.cart
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-6xl mb-6">🛒</p>
            <h1 className="text-4xl font-bold text-gold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Add some delicious items to get started!</p>
            <Link
              to="/menu"
              className="inline-block px-8 py-3 bg-gold text-black rounded font-bold hover:bg-yellow-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
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
          <h1 className="text-5xl font-bold text-gold mb-2">🛒 Your Cart</h1>
          <p className="text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-coffee border border-coffee rounded-lg p-5 mb-4 flex gap-4 hover:border-gold transition-colors"
                >
                  {/* Image */}
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-gold text-lg font-semibold mb-3">{formatPriceShort(item.price)}</p>
                    <p className="text-gray-400 text-sm mb-3">
                      Subtotal: <span className="text-gold font-bold">{formatPriceShort(item.price * item.quantity)}</span>
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-coffee rounded bg-black">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                menuItemId: item.menuItemId,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            )
                          }
                          className="px-3 py-2 text-gold hover:bg-coffee transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 text-white font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                menuItemId: item.menuItemId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          className="px-3 py-2 text-gold hover:bg-coffee transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch(removeFromCart(item.menuItemId))}
                        className="px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                      >
                        ✕ Remove
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-dark-coffee border border-coffee rounded-lg p-6 h-fit sticky top-20"
          >
            <h2 className="text-2xl font-bold text-gold mb-6">📋 Order Summary</h2>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 border-b border-coffee pb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatPriceShort(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (5%)</span>
                <span className="text-green-400">{formatPriceShort(tax)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-400 font-bold' : ''}>
                  {deliveryFee === 0 ? '✓ FREE' : formatPriceShort(deliveryFee)}
                </span>
              </div>
            </div>

            {/* Total */}
            <motion.div
              className="flex justify-between text-white text-xl font-bold mb-6 p-4 bg-gradient-to-r from-gold to-coffee rounded"
            >
              <span>Total</span>
              <span>{formatPriceShort(totalAmount)}</span>
            </motion.div>

            {/* Checkout Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/checkout"
                className="w-full block text-center bg-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
              >
                Proceed to Checkout →
              </Link>
            </motion.div>

            {/* Continue Shopping */}
            <motion.div whileHover={{ scale: 1.02 }} className="mt-3">
              <Link
                to="/menu"
                className="w-full block text-center bg-coffee text-white py-2 rounded-lg font-semibold hover:bg-opacity-80 transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Cart
