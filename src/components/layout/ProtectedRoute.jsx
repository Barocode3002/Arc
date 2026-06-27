import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    // Redirect to login if there is no user session
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
