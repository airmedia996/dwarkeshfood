import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  menuItemId: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  totalAmount: number
}

const initialState: CartState = {
  items: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')!) : [],
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  totalAmount: 0,
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const deliveryFee = subtotal > 500 ? 0 : 50
  const totalAmount = subtotal + tax + deliveryFee

  return { subtotal, tax, deliveryFee, totalAmount }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.menuItemId === action.payload.menuItemId
      )

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }

      const totals = calculateTotals(state.items)
      state.subtotal = totals.subtotal
      state.tax = totals.tax
      state.deliveryFee = totals.deliveryFee
      state.totalAmount = totals.totalAmount

      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.menuItemId !== action.payload)

      const totals = calculateTotals(state.items)
      state.subtotal = totals.subtotal
      state.tax = totals.tax
      state.deliveryFee = totals.deliveryFee
      state.totalAmount = totals.totalAmount

      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ menuItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.menuItemId === action.payload.menuItemId)
      if (item) {
        item.quantity = action.payload.quantity
      }

      const totals = calculateTotals(state.items)
      state.subtotal = totals.subtotal
      state.tax = totals.tax
      state.deliveryFee = totals.deliveryFee
      state.totalAmount = totals.totalAmount

      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      state.subtotal = 0
      state.tax = 0
      state.deliveryFee = 0
      state.totalAmount = 0
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
