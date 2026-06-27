import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, Clock, Package, Users,
  AlertTriangle, ArrowRight, TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CAFE_ID, formatDate, formatTime, capitalize, isLowStock, cn } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { statusVariant } from '../../utils/helpers'

export default function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const cafeId = DEFAULT_CAFE_ID

    const [bookingsRes, pendingRes, staffRes, inventoryRes, recentRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('cafe_id', cafeId).eq('date', today),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('cafe_id', cafeId).eq('status', 'pending'),
      supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('cafe_id', cafeId).eq('date', today).eq('status', 'present'),
      supabase.from('inventory_items').select('*').eq('cafe_id', cafeId),
      supabase.from('bookings').select('*').eq('cafe_id', cafeId).order('created_at', { ascending: false }).limit(5),
    ])

    const lowStock = (inventoryRes.data || []).filter((i) => isLowStock(i.current_stock, i.min_stock))

    setStats({
      todayBookings: bookingsRes.count || 0,
      pendingBookings: pendingRes.count || 0,
      staffOnShift: staffRes.count || 0,
      lowStockCount: lowStock.length,
    })
    setRecentBookings(recentRes.data || [])
    setLowStockItems(lowStock)
    setLoading(false)
  }

  if (loading) return <PageSpinner />

  const statCards = [
    { label: t('admin.dashboard.stats.bookings'), value: stats.todayBookings, icon: CalendarCheck, color: 'text-brand-600', bg: 'bg-brand-100' },
    { label: t('admin.dashboard.stats.pending'), value: stats.pendingBookings, icon: Clock, color: 'text-warning-700', bg: 'bg-warning-50' },
    { label: t('admin.dashboard.stats.staff'), value: stats.staffOnShift, icon: Users, color: 'text-info-700', bg: 'bg-info-50' },
    { label: t('admin.dashboard.stats.low_stock'), value: stats.lowStockCount, icon: Package, color: stats.lowStockCount > 0 ? 'text-danger-700' : 'text-success-700', bg: stats.lowStockCount > 0 ? 'bg-danger-50' : 'bg-success-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.nav.overview')}</h1>
        <p className="text-sm text-brand-500 mt-1">{t('admin.dashboard.welcome')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className={`animate-fade-in delay-${i + 1}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-brand-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card title={t('admin.dashboard.recent.title')} subtitle={t('admin.dashboard.recent.subtitle')}>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-brand-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-brand-900">{booking.guest_name}</p>
                  <p className="text-xs text-brand-500">
                    {formatDate(booking.date)} · {formatTime(booking.time)} · {booking.guest_count} {t('admin.dashboard.recent.guests')}
                  </p>
                </div>
                <Badge variant={statusVariant(booking.status)}>
                  {capitalize(booking.status)}
                </Badge>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p className="text-sm text-brand-400 py-4 text-center">{t('admin.dashboard.recent.no_bookings')}</p>
            )}
          </div>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3"
          >
            {t('admin.dashboard.recent.view_all')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          title={t('admin.dashboard.alerts.title')}
          subtitle={lowStockItems.length > 0 ? t('admin.dashboard.alerts.items_attention', { count: lowStockItems.length }) : t('admin.dashboard.alerts.all_healthy')}
        >
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-brand-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-danger-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">{item.name}</p>
                    <p className="text-xs text-brand-500">{item.unit}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold text-danger-700">{item.current_stock}</p>
                  <p className="text-xs text-brand-400">{t('admin.dashboard.alerts.min')} {item.min_stock}</p>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="flex items-center gap-3 py-4">
                <TrendingUp className="h-5 w-5 text-success-500" />
                <p className="text-sm text-success-700">{t('admin.dashboard.alerts.all_healthy_msg')}</p>
              </div>
            )}
          </div>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3"
          >
            {t('admin.dashboard.alerts.manage')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  )
}
