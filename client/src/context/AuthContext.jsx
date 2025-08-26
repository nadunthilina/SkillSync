import { createContext, useContext, useEffect, useState } from 'react'
import { AuthAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const { data } = await AuthAPI.me()
      setUser(data.user || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { checkAuth() }, [])

  const login = async (email, password) => {
    const emailSanitized = (email || '').trim().toLowerCase()
    const { data } = await AuthAPI.login({ email: emailSanitized, password })
    setUser(data.user)
    return data.user
  }
  const signup = async (name, email, password, role) => {
    const payload = {
      name: (name || '').trim(),
      email: (email || '').trim().toLowerCase(),
      password,
      ...(role ? { role } : {}),
    }
    const { data } = role ? await AuthAPI.registerWithRole(payload) : await AuthAPI.register(payload)
    setUser(data.user)
    return data.user
  }
  const logout = async () => {
    await AuthAPI.logout()
    setUser(null)
    // Ensure landing redirect after logout, avoiding ProtectedRoute races
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
