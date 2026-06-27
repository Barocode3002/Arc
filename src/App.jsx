import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import './i18n/index'

import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import Menu from './pages/Menu'
import Booking from './pages/Booking'

// Admin Pages
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Bookings from './pages/admin/Bookings'
import MenuManager from './pages/admin/MenuManager'
import Staff from './pages/admin/Staff'
import Shifts from './pages/admin/Shifts'
import Inventory from './pages/admin/Inventory'

function LanguageDirectionSync() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const isArabic = i18n.language?.startsWith('ar')
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LanguageDirectionSync />
        <Routes>
          {/* Public Routes */}
          <Route path="/"              element={<Home />} />
          <Route path="/:slug/menu"   element={<Menu />} />
          <Route path="/:slug/book"   element={<Booking />} />

          {/* Admin Login */}
          <Route path="/admin/login"  element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                element={<Dashboard />} />
              <Route path="bookings"      element={<Bookings />} />
              <Route path="menu"          element={<MenuManager />} />
              <Route path="staff"         element={<Staff />} />
              <Route path="shifts"        element={<Shifts />} />
              <Route path="inventory"     element={<Inventory />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}