import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

interface AuthState {
  user: User | null
  session: any
  token: string | null
  isLoading: boolean
  error: string | null
}

const getStoredSession = () => {
  const stored = localStorage.getItem('session')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

const storedSession = getStoredSession()

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  session: storedSession,
  token: storedSession?.access_token || null,
  isLoading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUser: (state, action: PayloadAction<{ user: User; session: any }>) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.token = action.payload.session?.access_token || null
      state.error = null
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('session', JSON.stringify(action.payload.session))
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.session = null
      state.token = null
      state.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    }
  }
})

export const { setLoading, setUser, setError, clearError, logout } = authSlice.actions
export default authSlice.reducer

export const signUp = async (email: string, password: string, name: string, phone?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone }
    }
  })
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
