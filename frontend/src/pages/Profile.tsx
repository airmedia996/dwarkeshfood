import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/index'
import { usersAPI } from '../services/api'
import api from '../services/api'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [profile, setProfile] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Additional state
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password' | 'stats'>('profile')
  const [addresses, setAddresses] = useState<any[]>([])
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: '', fullAddress: '', city: '', isDefault: false })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await usersAPI.getProfile()
        setProfile(response.data)
        setEditData(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch profile:', err)
        setError(err.response?.data?.error || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get('/users/addresses')
        setAddresses(response.data)
      } catch (err) {
        console.error('Failed to fetch addresses')
      }
    }
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/stats')
        setStats(response.data)
      } catch (err) {
        console.error('Failed to fetch stats')
      }
    }
    if (user?.id) {
      fetchAddresses()
      fetchStats()
    }
  }, [user?.id])

  const handleSaveProfile = async () => {
    try {
      await usersAPI.updateProfile(editData)
      setProfile(editData)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile')
      setEditData(profile)
    }
  }

  const handleEditCancel = () => {
    setEditData(profile)
    setIsEditing(false)
  }

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.fullAddress) {
      alert('Please fill in required fields')
      return
    }
    try {
      const response = await api.post('/users/addresses', newAddress)
      setAddresses([...addresses, response.data])
      setShowAddAddress(false)
      setNewAddress({ label: '', fullAddress: '', city: '', isDefault: false })
    } catch (err) {
      alert('Failed to add address')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      await api.delete(`/users/addresses/${id}`)
      setAddresses(addresses.filter(a => a.id !== id))
    } catch (err) {
      alert('Failed to delete address')
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    try {
      await api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      alert('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to change password')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-12 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center text-gray-400"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mb-4"></div>
          <p>Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-400 text-lg mb-4">{error || 'Please login to view your profile'}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
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
          <h1 className="text-5xl font-bold text-gold mb-2">👤 My Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'profile', label: '👤 Profile', icon: '👤' },
            { id: 'addresses', label: '📍 Addresses', icon: '📍' },
            { id: 'password', label: '🔒 Password', icon: '🔒' },
            { id: 'stats', label: '📊 Stats', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gold text-black'
                  : 'bg-dark-coffee text-gray-300 hover:bg-coffee'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-dark-coffee border border-coffee rounded-lg p-8"
            >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none"
                />
              ) : (
                <p className="text-white text-lg font-semibold">{profile.name}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📧 Email</label>
              <p className="text-white text-lg">{profile.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📱 Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData?.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none"
                />
              ) : (
                <p className="text-white text-lg">{profile.phone || 'Not set'}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📍 Address</label>
              {isEditing ? (
                <textarea
                  value={editData?.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  placeholder="Enter your delivery address"
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                  rows={3}
                />
              ) : (
                <p className="text-white text-lg">{profile.address || 'Not set'}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-black bg-opacity-50 rounded p-4"
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Account Type</label>
              <p className="text-gold font-bold uppercase">{profile.role || 'Customer'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="border-t border-coffee pt-4"
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Member Since</label>
              <p className="text-white text-lg">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex gap-4"
          >
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  ✓ Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditCancel}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  ✕ Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                >
                  ✏️ Edit Profile
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-dark-coffee border border-coffee rounded-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gold">📍 Saved Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="px-4 py-2 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
                >
                  + Add Address
                </button>
              </div>

              {showAddAddress && (
                <div className="bg-black p-4 rounded-lg mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Label (e.g., Home, Work)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-coffee border border-coffee rounded text-white"
                  />
                  <textarea
                    placeholder="Full Address"
                    value={newAddress.fullAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-coffee border border-coffee rounded text-white"
                    rows={2}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-coffee border border-coffee rounded text-white"
                  />
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    />
                    Set as default address
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAddress}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No saved addresses</p>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="bg-black p-4 rounded-lg flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gold font-bold">{address.label}</span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">Default</span>
                          )}
                        </div>
                        <p className="text-white">{address.fullAddress}</p>
                        {address.city && <p className="text-gray-400 text-sm">{address.city}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-dark-coffee border border-coffee rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gold mb-6">🔒 Change Password</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-coffee rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-coffee rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-coffee rounded text-white"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-dark-coffee border border-coffee rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gold mb-6">📊 Your Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-black p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-gold">{stats?.totalOrders || 0}</p>
                  <p className="text-gray-400">Total Orders</p>
                </div>
                <div className="bg-black p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-400">{stats?.completedOrders || 0}</p>
                  <p className="text-gray-400">Completed</p>
                </div>
                <div className="bg-black p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-gold">₵{(stats?.totalSpent || 0).toFixed(2)}</p>
                  <p className="text-gray-400">Total Spent</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gold mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="bg-black p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">#{order.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-bold">₵{order.totalAmount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'delivered' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Profile
