import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  Users,
  Clock,
  Package,
  Coffee,
  Power
} from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../ui/LanguageToggle'

const navItems = [
  { to: '/admin/bookings', icon: CalendarCheck, key: 'bookings' },
  { to: '/admin/menu', icon: UtensilsCrossed, key: 'menu' },
  { to: '/admin/staff', icon: Users, key: 'staff' },
  { to: '/admin/shifts', icon: Clock, key: 'shifts' },
  { to: '/admin/inventory', icon: Package, key: 'inventory' },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <aside className="fixed start-0 top-0 bottom-0 w-[260px] bg-brand-900 text-white flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Coffee className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight">Arc.</h1>
            <p className="text-xs text-brand-400">{t('admin.nav.dashboard')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium',
                'transition-all duration-200',
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/50'
                  : 'text-brand-300 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span>{t(`admin.nav.${item.key}`)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        <NavLink
          to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-brand-300 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Coffee className="h-[18px] w-[18px] shrink-0" />
          <span>{t('admin.nav.home')}</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:text-white hover:bg-danger-500/20 transition-all duration-200 cursor-pointer"
        >
          <Power className="h-[18px] w-[18px] shrink-0" />
          <span>{t('admin.nav.logout')}</span>
        </button>
        <div className="flex items-center justify-between px-4">
          <p className="text-xs text-brand-500">Arc. Platform v1.0</p>
          <LanguageToggle compact />
        </div>
      </div>
    </aside>
  )
}
