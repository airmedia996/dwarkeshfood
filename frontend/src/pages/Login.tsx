import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authAPI.login(formData)
      dispatch(setUser(response.data))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-coffee py-12">
      <div className="max-w-md mx-auto bg-dark-coffee border border-coffee rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gold mb-6 text-center">Login</h1>
        {error && <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold text-black py-2 rounded font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-gold hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
