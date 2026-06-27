import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, Sparkles, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBookings } from '../../hooks/useBookings'
import { useRealtime } from '../../hooks/useRealtime'
import { DEFAULT_CAFE_ID, formatDate, formatTime, formatCurrency, statusVariant } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Select, Input } from '../../components/ui/Input'

export default function Bookings() {
  const { t } = useTranslation()
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    updateStatus,
    addBookingFromRealtime,
  } = useBookings(DEFAULT_CAFE_ID)

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: '',
  })
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings(filters)
  }, [fetchBookings, filters])

  // Setup realtime listener
  useRealtime('bookings', DEFAULT_CAFE_ID, {
    onInsert: (newBooking) => {
      addBookingFromRealtime(newBooking)
    },
    onUpdate: (updatedBooking) => {
      addBookingFromRealtime(updatedBooking)
    },
  })

  const handleStatusChange = async (id, status) => {
    await updateStatus(id, status)
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => ({ ...prev, status }))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.bookings.title')}</h1>
            <Badge variant="info" dot>{t('admin.bookings.live_updates')}</Badge>
          </div>
          <p className="text-sm text-brand-500 mt-1">{t('admin.bookings.subtitle')}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchBookings(filters)}
          loading={loading}
        >
          <RefreshCw className="h-4 w-4" /> {t('admin.bookings.refresh')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('admin.bookings.filters.date')}
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
          />
          <Select
            label={t('admin.bookings.filters.status')}
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '', label: t('admin.bookings.filters.all_statuses') },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            label={t('admin.bookings.filters.type')}
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            options={[
              { value: '', label: t('admin.bookings.filters.all_types') },
              { value: 'regular', label: 'Regular' },
              { value: 'special', label: 'Special Opening' },
            ]}
          />
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-sm">
          {t('admin.bookings.error')} {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Table/List */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-sm">
                <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t('admin.bookings.table.guest')}</th>
                    <th className="px-6 py-4">{t('admin.bookings.table.date_time')}</th>
                    <th className="px-6 py-4">{t('admin.bookings.table.guests')}</th>
                    <th className="px-6 py-4">{t('admin.bookings.table.type')}</th>
                    <th className="px-6 py-4">{t('admin.bookings.table.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-white">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`cursor-pointer hover:bg-brand-50/50 transition-colors ${
                        selectedBooking?.id === booking.id ? 'bg-brand-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-brand-900">{booking.guest_name}</div>
                        <div className="text-xs text-brand-500 font-mono mt-0.5">{booking.booking_ref}</div>
                      </td>
                      <td className="px-6 py-4 text-brand-700">
                        <div>{formatDate(booking.date)}</div>
                        <div className="text-xs text-brand-500 mt-0.5">{formatTime(booking.time)}</div>
                      </td>
                      <td className="px-6 py-4 text-brand-950 font-medium">
                        {booking.guest_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1">
                          {booking.type === 'special' ? (
                            <Badge variant="gold">
                              <Sparkles className="h-3 w-3" /> {t('admin.bookings.type.special')}
                            </Badge>
                          ) : (
                            <Badge variant="neutral">{t('admin.bookings.type.regular')}</Badge>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                  {!loading && bookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-brand-400">
                        {t('admin.bookings.no_results')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar details */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <Card title={t('admin.bookings.details.title')} subtitle={selectedBooking.booking_ref} className="sticky top-6">
              <div className="space-y-6">
                {/* Guest Profile */}
                <div className="bg-brand-50/50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-xs text-brand-400 block uppercase font-medium">{t('admin.bookings.details.guest_name')}</span>
                    <span className="text-base font-semibold text-brand-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-brand-400 block uppercase font-medium">{t('admin.bookings.details.phone')}</span>
                    <span className="text-sm font-medium text-brand-700">{selectedBooking.guest_phone}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-brand-100 pb-2 text-sm">
                    <span className="text-brand-500">{t('admin.bookings.details.date')}</span>
                    <span className="font-medium text-brand-900">{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-100 pb-2 text-sm">
                    <span className="text-brand-500">{t('admin.bookings.details.time')}</span>
                    <span className="font-medium text-brand-900">{formatTime(selectedBooking.time)}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-100 pb-2 text-sm">
                    <span className="text-brand-500">{t('admin.bookings.details.guests')}</span>
                    <span className="font-medium text-brand-900">{selectedBooking.guest_count} {t('admin.bookings.details.persons')}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-100 pb-2 text-sm">
                    <span className="text-brand-500">{t('admin.bookings.details.type')}</span>
                    <span className="font-medium text-brand-900 uppercase">{selectedBooking.type}</span>
                  </div>
                </div>

                {/* Special Request Details */}
                {selectedBooking.type === 'special' && (
                  <div className="border-t border-brand-100 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> {t('admin.bookings.details.special_request')}
                    </h4>
                    {selectedBooking.occasion && (
                      <div>
                        <span className="text-xs text-brand-400 block uppercase font-medium">{t('admin.bookings.details.occasion')}</span>
                        <span className="text-sm font-medium text-brand-900">{selectedBooking.occasion}</span>
                      </div>
                    )}
                    {selectedBooking.sticker_text && (
                      <div>
                        <span className="text-xs text-brand-400 block uppercase font-medium">{t('admin.bookings.details.banner_text')}</span>
                        <span className="text-sm italic text-brand-800">"{selectedBooking.sticker_text}"</span>
                      </div>
                    )}
                    {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                      <div>
                        <span className="text-xs text-brand-400 block uppercase font-medium mb-1.5">{t('admin.bookings.details.addons')}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBooking.addons.map((addon) => (
                            <Badge key={addon} variant="gold">{addon}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-brand-100 pt-4 space-y-2">
                  <span className="text-xs text-brand-400 block uppercase font-medium mb-2">{t('admin.bookings.details.actions')}</span>
                  {selectedBooking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                      >
                        {t('admin.bookings.actions.confirm')}
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                      >
                        {t('admin.bookings.actions.cancel')}
                      </Button>
                    </div>
                  )}

                  {selectedBooking.status === 'confirmed' && (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                    >
                      {t('admin.bookings.actions.cancel_booking')}
                    </Button>
                  )}

                  {selectedBooking.status === 'cancelled' && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                    >
                      {t('admin.bookings.actions.restore')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12 text-brand-400 border-dashed border-2">
              {t('admin.bookings.select_booking')}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
