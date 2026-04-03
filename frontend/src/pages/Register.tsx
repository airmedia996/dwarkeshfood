import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, signUp } from '../store/slices/authSlice'
import { supabase } from '../lib/supabase'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.user_metadata?.name || '',
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          role: profile?.role || 'customer'
        }
        dispatch(setUser({ user, session }))
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signUp(
        formData.email, 
        formData.password, 
        formData.name,
        formData.phone
      )
      const data = result as { user: any; session: any }
      
      if (data.user && !data.session) {
        setSuccess(true)
        setError('')
      } else if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single()

        const user = {
          id: data.user?.id || '',
          email: data.user?.email || '',
          name: profile?.name || formData.name,
          phone: profile?.phone || formData.phone,
          role: profile?.role || 'customer'
        }
        dispatch(setUser({ user, session: data.session }))
        navigate('/')
      }
    } catch (err: any) {
      console.log('Register error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black py-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-dark-coffee border border-coffee rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gold mb-4">Check Your Email</h1>
            <p className="text-white mb-4">
              We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
            </p>
            <Link to="/login" className="text-gold hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
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
