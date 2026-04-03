import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await api.post('/auth/forgot-password', { email })
      setMessage(response.data.message)
      // In production, don't show the token
      if (response.data.resetToken) {
        console.log('Reset token (dev only):', response.data.resetToken)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link')
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
          <h1 className="text-3xl font-bold text-gold mt-4">Forgot Password?</h1>
          <p className="text-gray-400 mt-2">Enter your email to reset your password</p>
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
              <p className="text-gray-400 text-sm mb-6">
                Check your email for the reset link. The link expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500"
              >
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-400 text-sm mb-2 block">📧 Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-4 py-3 bg-black border border-coffee rounded-lg text-white focus:border-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full px-6 py-3 bg-gold text-black rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!message && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-gold hover:text-yellow-500 text-sm">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword