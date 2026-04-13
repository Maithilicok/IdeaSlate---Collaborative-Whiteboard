import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('/api/auth/me')
        setUser(res.data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    setUser(res.data)
    return res.data
  }

  const register = async (fullName, email, password) => {
    const res = await api.post('/api/auth/register', { fullName, email, password })
    return res.data
  }

  const logout = async () => {
    await api.post('/api/auth/logout', {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)