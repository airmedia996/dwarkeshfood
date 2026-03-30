import { useEffect, useState } from 'react'
import { ordersAPI } from '../services/api'
import { Link } from 'react-router-dom'

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">My Orders</h1>
        {isLoading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">No orders yet. <Link to="/menu" className="text-gold hover:underline">Order now</Link></p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-dark-coffee border border-coffee rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold">Order #{order.id.substring(0, 8)}</h3>
                    <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    order.status === 'delivered' ? 'bg-green-600' : 'bg-yellow-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="mb-4 pb-4 border-b border-coffee">
                  <p className="text-gold font-bold">₹{order.totalAmount}</p>
                </div>
                <Link
                  to={`/order/${order.id}/tracking`}
                  className="text-gold hover:text-yellow-500"
                >
                  Track Order →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
