import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MenuItem {
  id: string
  name: string
  category: string
  description?: string
  price: number
  image: string
  rating: number
  reviewCount: number
  isVegetarian: boolean
  spiceLevel?: string
  preparationTime?: number
  availability: boolean
}

interface MenuState {
  items: MenuItem[]
  isLoading: boolean
  error: string | null
  selectedCategory: string | null
  searchQuery: string
}

const initialState: MenuState = {
  items: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
})

export const {
  setLoading,
  setMenuItems,
  setError,
  setSelectedCategory,
  setSearchQuery,
} = menuSlice.actions
export default menuSlice.reducer
