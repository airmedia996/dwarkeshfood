import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-bold text-gold">🍽️</Link>
          <h1 className="text-3xl font-bold text-gold mt-4">Reset Password</h1>
          <p className="text-gray-400 mt-2">Enter your new password</p>
        </div>

        <div className="bg-dark-coffee border-2 border-coffee rounded-xl p-8">
          {message ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">✅</div>
              <p className="text-green-400 mb-4">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
              >
                Go to Login
              </Link>
            </motion.div>
          ) : token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-400 text-sm mb-2 block">🔒 New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  className="w-full px-4 py-3 bg-black border border-coffee rounded-lg text-white focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">🔒 Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className="w-full px-4 py-3 bg-black border border-coffee rounded-lg text-white focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-red-400 mb-4">{error}</p>
              <Link
                to="/forgot-password"
                className="inline-block px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
              >
                Request New Link
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gold hover:text-yellow-500 text-sm">
              ← Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword