import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Restore user from localStorage if present
      const savedUser = localStorage.getItem('user')
      if (savedUser) setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const userData = await authService.login(email, password)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const userData = await authService.register(data)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    localStorage.removeItem('user')
  }, [])

  const isAuthenticated = !!localStorage.getItem('accessToken')

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
