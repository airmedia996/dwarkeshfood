import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/index'
import { clearCart } from '../store/slices/cartSlice'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount } = useSelector((state: RootState) => state.cart)
  const { user } = useSelector((state: RootState) => state.auth)
  const [formData, setFormData] = useState({
    address: '',
    paymentMethod: 'card',
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
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Delivery Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
              rows={3}
            />
          </div>
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
            >
              <option value="card">Card (Stripe)</option>
              <option value="momo">Mobile Money (Momo)</option>
              <option value="cash">Cash on Delivery</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Special Instructions</label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
              rows={2}
            />
          </div>
          <div className="mb-6 pb-6 border-b border-coffee">
            <div className="flex justify-between text-white text-lg">
              <span>Total:</span>
              <span className="text-gold font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold text-black py-3 rounded font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Checkout
