import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})

export const { setLoading, setUser, setError, clearError, logout } = authSlice.actions
export default authSlice.reducer
