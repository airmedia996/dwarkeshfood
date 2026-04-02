import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/index'
import { usersAPI } from '../services/api'
import { formatPriceShort } from '../utils/currency'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [profile, setProfile] = useState<any>(null)
  const [editProfile, setEditProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Memoize profile data to prevent unnecessary re-renders
  const profileData = useMemo(() => profile, [profile])

  useEffect(() => {
    // Cache key for localStorage
    const CACHE_KEY = `profile_${user?.id}`
    const CACHE_TIME = 5 * 60 * 1000 // 5 minutes

    const fetchProfile = async () => {
      try {
        // Check if cached data is still valid
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_TIME) {
            setProfile(data)
            setEditProfile(data)
            setIsLoading(false)
            return
          }
        }

        // Fetch fresh data if cache is invalid
        const response = await usersAPI.getProfile()
        setProfile(response.data)
        setEditProfile(response.data)

        // Cache the data
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: response.data,
            timestamp: Date.now(),
          })
        )
      } catch (error) {
        console.error('Failed to fetch profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  const handleSaveProfile = async () => {
    try {
      // Call API to update profile
      await usersAPI.updateProfile(editProfile)
      setProfile(editProfile)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
      setEditProfile(profile)
    }
  }

  const handleEditCancel = () => {
    setEditProfile(profile)
    setIsEditing(false)
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

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-lg">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
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
          <h1 className="text-5xl font-bold text-gold mb-2">👤 My Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-coffee rounded mt-4"></div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-coffee border border-coffee rounded-lg p-8"
        >
          <div className="space-y-6">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editProfile?.name || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50"
                />
              ) : (
                <p className="text-white text-lg font-semibold">{profileData.name}</p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📧 Email</label>
              <p className="text-white text-lg">{profileData.email}</p>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📱 Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editProfile?.phone || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50"
                />
              ) : (
                <p className="text-white text-lg">{profileData.phone}</p>
              )}
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">📍 Address</label>
              {isEditing ? (
                <textarea
                  value={editProfile?.address || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                  placeholder="Enter your delivery address"
                  className="w-full px-4 py-2 bg-black border border-coffee rounded text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50"
                  rows={3}
                />
              ) : (
                <p className="text-white text-lg">{profileData.address || 'Not set'}</p>
              )}
            </motion.div>

            {/* Account Type */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-black bg-opacity-50 rounded p-4"
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Account Type</label>
              <p className="text-gold font-bold uppercase">{profileData.role || 'Customer'}</p>
            </motion.div>

            {/* Member Since */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="border-t border-coffee pt-4"
            >
              <label className="text-gray-400 text-sm uppercase mb-2 block">Member Since</label>
              <p className="text-white text-lg">
                {new Date(profileData.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 bg-coffee text-white rounded-lg font-bold hover:bg-opacity-80 transition-colors"
                >
                  🔒 Change Password
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
