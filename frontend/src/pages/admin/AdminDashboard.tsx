import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '../../services/api'
import MenuManager from './MenuManager'
import OrderManager from './OrderManager'
import ChatManager from './ChatManager'

type AdminTab = 'dashboard' | 'menu' | 'orders' | 'chat'

const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

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

  const tabs = [
    { id: 'dashboard' as AdminTab, label: '📊 Dashboard', icon: '📊' },
    { id: 'menu' as AdminTab, label: '🍽️ Menu Manager', icon: '🍽️' },
    { id: 'orders' as AdminTab, label: '📦 Orders', icon: '📦' },
    { id: 'chat' as AdminTab, label: '💬 Support Chat', icon: '💬' },
  ]

  const StatCard = ({ icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-200 text-sm uppercase mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-12 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center text-gray-400"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4 mx-auto"></div>
          <p>Loading admin dashboard...</p>
        </motion.div>
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
          <h1 className="text-5xl font-bold text-gold mb-2">👑 Admin Dashboard</h1>
          <p className="text-gray-400">Manage your restaurant operations</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gold text-black shadow-lg'
                  : 'bg-dark-coffee border border-coffee text-white hover:border-gold'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && dashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon="📦"
                label="Total Orders"
                value={dashboard.totalOrders}
                color="from-blue-600 to-blue-800"
              />
              <StatCard
                icon="👥"
                label="Customers"
                value={dashboard.totalCustomers}
                color="from-green-600 to-green-800"
              />
              <StatCard
                icon="⏳"
                label="Pending Orders"
                value={dashboard.pendingOrders}
                color="from-orange-600 to-orange-800"
              />
              <StatCard
                icon="💰"
                label="Revenue"
                value={`₹${dashboard.revenue.toFixed(0)}`}
                color="from-gold to-yellow-700"
              />
            </div>

            {/* Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-coffee border border-coffee rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gold mb-4">📈 Quick Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div className="bg-black bg-opacity-50 rounded p-4">
                  <p className="text-sm text-gray-400 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gold">
                    ₹{dashboard.revenue > 0 ? (dashboard.revenue / dashboard.totalOrders).toFixed(0) : 0}
                  </p>
                </div>
                <div className="bg-black bg-opacity-50 rounded p-4">
                  <p className="text-sm text-gray-400 mb-1">Order Completion Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {dashboard.totalOrders > 0 ? (((dashboard.totalOrders - dashboard.pendingOrders) / dashboard.totalOrders) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="bg-black bg-opacity-50 rounded p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Menu Items</p>
                  <p className="text-2xl font-bold text-blue-400">{dashboard.menuItems || 0}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Menu Manager View */}
        {activeTab === 'menu' && <MenuManager />}

        {/* Orders Manager View */}
        {activeTab === 'orders' && <OrderManager />}

        {/* Chat Manager View */}
        {activeTab === 'chat' && <ChatManager />}
      </div>
    </div>
  )
}

export default AdminDashboard
