import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const USE_MOCK = false // Set to true to use mock data

const api = axios.create({
  baseURL: USE_MOCK ? '' : API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}

// Menu API
export const menuAPI = {
  getMenuItems: (params?: { category?: string; search?: string }) =>
    api.get('/menu', { params }),
  getCategories: () => api.get('/menu/categories'),
  getMenuItem: (id: string) => api.get(`/menu/${id}`),
  createMenuItem: (data: any) => api.post('/menu', data),
  updateMenuItem: (id: string, data: any) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id: string) => api.delete(`/menu/${id}`),
}

// Orders API
export const ordersAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
  rateOrder: (id: string, data: any) => api.put(`/orders/${id}/rating`, data),
  trackOrder: (id: string) => api.get(`/orders/${id}/tracking`),
}

// Payments API
export const paymentsAPI = {
  createStripeIntent: (orderId: string) =>
    api.post('/payments/stripe/intent', { orderId }),
  confirmStripePayment: (orderId: string, paymentIntentId: string) =>
    api.post('/payments/stripe/confirm', { orderId, paymentIntentId }),
  initiateMomoPayment: (orderId: string, phone: string) =>
    api.post('/payments/momo/request', { orderId, phone }),
  checkMomoStatus: (referenceId: string) =>
    api.get(`/payments/momo/status/${referenceId}`),
  confirmCashPayment: (orderId: string) =>
    api.post('/payments/cash/confirm', { orderId }),
  getPayment: (id: string) => api.get(`/payments/${id}`),
  getPaymentByOrder: (orderId: string) => api.get(`/payments/order/${orderId}`),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  changePassword: (data: any) => api.post('/users/change-password', data),
  getStats: () => api.get('/users/stats'),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  getUsers: () => api.get('/admin/users'),
  assignDelivery: (orderId: string, deliveryPersonId: string) =>
    api.post('/admin/deliveries/assign', { orderId, deliveryPersonId }),
  getAnalytics: () => api.get('/admin/analytics'),
}

export default api
