import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await authAPI.register(formData)
      if (response.data && response.data.token) {
        dispatch(setUser(response.data))
        navigate('/')
      } else {
        setError('Invalid response from server')
      }
    } catch (err: any) {
      console.log('Register error:', err)
      setError('Registration failed. Please check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gold mb-6 text-center">Sign Up</h1>
          
          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
            />
            <input
              type="tel"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="text-gray-400 text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
