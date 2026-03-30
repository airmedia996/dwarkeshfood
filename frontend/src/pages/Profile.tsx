import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/index'
import { usersAPI } from '../services/api'

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await usersAPI.getProfile()
        setProfile(response.data)
      } catch (error) {
        console.error('Failed to fetch profile')
      }
    }
    fetchProfile()
  }, [])

  if (!profile) {
    return <div className="min-h-screen bg-black py-12 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold mb-8">My Profile</h1>
        <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Name</label>
              <p className="text-white text-lg">{profile.name}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-white text-lg">{profile.email}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Phone</label>
              <p className="text-white text-lg">{profile.phone}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Address</label>
              <p className="text-white text-lg">{profile.address || 'Not set'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-8 px-6 py-2 bg-gold text-black rounded font-bold hover:bg-yellow-500"
          >
            {isEditing ? 'Save' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
