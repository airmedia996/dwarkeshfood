import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import { io } from 'socket.io-client'

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getOrder(id!)
        setOrder(response.data)
        
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
        socket.emit('track-order', id)
        socket.on('order:updated', (data) => {
          setOrder((prev: any) => ({ ...prev, ...data }))
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

  if (isLoading || !order) {
    return <div className="min-h-screen bg-black py-12 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">Order Tracking</h1>
        <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-white font-bold mb-4">Order Status: <span className="text-gold">{order.status}</span></h2>
            <div className="space-y-4">
              {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status) => (
                <div
                  key={status}
                  className={`flex items-center ${
                    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
                      .indexOf(status) <=
                    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
                      .indexOf(order.status)
                      ? 'opacity-100'
                      : 'opacity-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center mr-4">
                    ✓
                  </div>
                  <span className="text-white capitalize">{status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black border border-coffee rounded p-4">
            <h3 className="text-gold font-bold mb-4">Order Details</h3>
            <p className="text-gray-400 mb-2">Address: {order.deliveryAddress}</p>
            <p className="text-gray-400 mb-2">Total: ₹{order.totalAmount}</p>
            <p className="text-gray-400">Payment Method: {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
