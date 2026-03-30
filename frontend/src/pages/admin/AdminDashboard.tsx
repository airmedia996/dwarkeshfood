import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminAPI.getDashboard()
        setDashboard(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (isLoading) {
    return <div className="min-h-screen bg-black py-12 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">Admin Dashboard</h1>
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-gray-400 text-sm uppercase mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-gold">{dashboard.totalOrders}</p>
            </div>
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-gray-400 text-sm uppercase mb-2">Customers</h3>
              <p className="text-3xl font-bold text-gold">{dashboard.totalCustomers}</p>
            </div>
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-gray-400 text-sm uppercase mb-2">Pending Orders</h3>
              <p className="text-3xl font-bold text-gold">{dashboard.pendingOrders}</p>
            </div>
            <div className="bg-dark-coffee border border-coffee rounded-lg p-6">
              <h3 className="text-gray-400 text-sm uppercase mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-gold">₹{dashboard.revenue.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
