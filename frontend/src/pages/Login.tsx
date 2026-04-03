import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, signIn } from '../store/slices/authSlice'
import { supabase } from '../lib/supabase'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      const result = await signIn(formData.email, formData.password)
      const data = result as { user: any; session: any }
      if (!data.user) {
        setError('Login failed')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const user = {
        id: data.user.id,
        email: data.user.email || '',
        name: profile?.name || data.user.user_metadata?.name || '',
        phone: profile?.phone || data.user.user_metadata?.phone || '',
        role: profile?.role || 'customer'
      }
      
      dispatch(setUser({ user, session: data.session }))
      navigate('/')
    } catch (err: any) {
      console.log('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-dark-coffee border border-coffee rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gold mb-6 text-center">Login</h1>
          
          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          
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
            <Link to="/register" className="text-gold hover:underline">
              Register
            </Link>
          </p>
          
          <p className="text-gray-400 text-center mt-2">
            <Link to="/forgot-password" className="text-gold hover:underline">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
