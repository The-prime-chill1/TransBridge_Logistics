import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('tb-token')
      if (!token) { setLoading(false); setInitialized(true); return }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch {
      localStorage.removeItem('tb-token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  useEffect(() => { checkAuth() }, [checkAuth])

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const { token, user } = res.data
    localStorage.setItem('tb-token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('tb-token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
