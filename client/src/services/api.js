import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tb-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const res = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
        const { token } = res.data
        localStorage.setItem('tb-token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        localStorage.removeItem('tb-token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    const message = error.response?.data?.message || 'Something went wrong'
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api

// Convenience methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
}

export const shipmentAPI = {
  track: (trackingNumber) => api.get(`/shipments/track/${trackingNumber}`),
  getAll: (params) => api.get('/shipments', { params }),
  getOne: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  delete: (id) => api.delete(`/shipments/${id}`),
  uploadImages: (id, formData) => api.post(`/shipments/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyShipments: (params) => api.get('/shipments/my', { params }),
}

export const quoteAPI = {
  create: (data) => api.post('/quotes', data),
  getAll: (params) => api.get('/quotes', { params }),
  getOne: (id) => api.get(`/quotes/${id}`),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  getMyQuotes: () => api.get('/quotes/my'),
}

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
}

export const supportAPI = {
  create: (data) => api.post('/support', data),
  getAll: (params) => api.get('/support', { params }),
  getOne: (id) => api.get(`/support/${id}`),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
  close: (id) => api.put(`/support/${id}/close`),
  getMy: () => api.get('/support/my'),
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getShipmentStats: (params) => api.get('/analytics/shipments', { params }),
}
