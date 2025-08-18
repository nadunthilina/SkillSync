import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center">Checking session...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
