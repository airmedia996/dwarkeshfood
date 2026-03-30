import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/index'
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Cart: React.FC = () => {
  const dispatch = useDispatch()
  const { items, subtotal, tax, deliveryFee, totalAmount } = useSelector(
    (state: RootState) => state.cart
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-3xl mb-4">🛒</p>
          <h1 className="text-3xl font-bold text-gold mb-4">Your Cart is Empty</h1>
          <Link
            to="/menu"
            className="inline-block px-8 py-3 bg-gold text-black rounded font-bold hover:bg-yellow-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            {items.map((item) => (
              <motion.div
                key={item.menuItemId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-dark-coffee border border-coffee rounded-lg p-4 mb-4 flex gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2">{item.name}</h3>
                  <p className="text-gold mb-2">₹{item.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-coffee rounded">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              menuItemId: item.menuItemId,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          )
                        }
                        className="px-3 py-1 text-gold"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 text-white">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              menuItemId: item.menuItemId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="px-3 py-1 text-gold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.menuItemId))}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-dark-coffee border border-coffee rounded-lg p-6 h-fit sticky top-20">
            <h2 className="text-2xl font-bold text-gold mb-6">Order Summary</h2>
            <div className="space-y-2 mb-6 border-b border-coffee pb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
            </div>
            <div className="flex justify-between text-white text-xl font-bold mb-6">
              <span>Total</span>
              <span className="text-gold">₹{totalAmount.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full block text-center bg-gold text-black py-3 rounded font-bold hover:bg-yellow-500 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
