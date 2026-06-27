import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CalendarHeart, Check, Sparkles, Coffee, ArrowLeft, ArrowRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBookings, useSpecialAddons } from '../hooks/useBookings'
import { formatCurrency, cn } from '../utils/helpers'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00',
]

const occasions = ['Birthday', 'Anniversary', 'Proposal', 'Graduation', 'Date Night', 'Other']

export default function Booking() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const [cafe, setCafe] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    type: 'regular',
    date: '',
    time: '',
    guest_count: 2,
    occasion: '',
    addons: [],
    sticker_text: '',
    guest_name: '',
    guest_phone: '',
  })

  const { createBooking } = useBookings(cafe?.id)
  const { addons, fetchAddons } = useSpecialAddons(cafe?.id)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('cafes')
        .select('*')
        .eq('slug', slug)
        .single()
      if (data) setCafe(data)
      setPageLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (cafe?.id && form.type === 'special') fetchAddons()
  }, [cafe?.id, form.type, fetchAddons])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleAddon = (addonName) => {
    setForm((prev) => ({
      ...prev,
      addons: prev.addons.includes(addonName)
        ? prev.addons.filter((a) => a !== addonName)
        : [...prev.addons, addonName],
    }))
  }

  const canProceed = () => {
    if (step === 1) return form.type
    if (step === 2) return form.date && form.time && form.guest_count > 0
    if (step === 3 && form.type === 'special') return form.occasion
    if (step === 3 && form.type === 'regular') return form.guest_name && form.guest_phone
    if (step === 4) return form.guest_name && form.guest_phone
    return true
  }

  const totalSteps = form.type === 'special' ? 4 : 3

  const handleSubmit = async () => {
    setSubmitting(true)
    const bookingData = {
      guest_name: form.guest_name,
      guest_phone: form.guest_phone,
      date: form.date,
      time: form.time,
      guest_count: form.guest_count,
      type: form.type,
      occasion: form.type === 'special' ? form.occasion : null,
      addons: form.type === 'special' ? form.addons : [],
      sticker_text: form.type === 'special' ? form.sticker_text : null,
    }
    const booking = await createBooking(bookingData)
    setSubmitting(false)
    if (booking) setResult(booking)
  }

  if (pageLoading) return <PageSpinner />

  if (!cafe) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-brand-300 mx-auto mb-4" />
          <h1 className="text-xl font-serif font-bold text-brand-900">{t('booking.not_found')}</h1>
        </div>
      </div>
    )
  }

  // ── SUCCESS SCREEN ──
  if (result) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 text-center shadow-lg border border-brand-200/50 animate-scale-in">

          {/* Check icon */}
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <Check className="h-8 w-8 text-green-500" />
          </div>

          <h2 className="text-xl font-serif font-bold text-brand-900 mb-1">{t('booking.success.title')}</h2>
          <p className="text-sm text-brand-500 mb-6">{t('booking.success.subtitle', { cafe: cafe.name })}</p>

          {/* Booking details */}
          <div className="bg-brand-50 rounded-xl p-4 space-y-2.5 text-start mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-brand-400">{t('booking.success.ref')}</span>
              <span className="font-mono font-bold text-brand-900">{result.booking_ref}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-400">{t('booking.success.date')}</span>
              <span className="text-brand-700">{result.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-400">{t('booking.success.time')}</span>
              <span className="text-brand-700">{result.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-400">{t('booking.success.guests')}</span>
              <span className="text-brand-700">{result.guest_count}</span>
            </div>
            {result.type === 'special' && result.occasion && (
              <div className="flex justify-between text-sm">
                <span className="text-brand-400">{t('booking.success.occasion')}</span>
                <span className="text-gold font-medium">✦ {result.occasion}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-brand-400 mb-6">
            {t('booking.success.note')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="gold"
              className="w-full"
              onClick={() => navigate(`/`)}
            >
              <Home className="h-4 w-4" />
              {t('booking.success.home')}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-brand-500 hover:text-brand-700"
              onClick={() => {
                setResult(null)
                setStep(1)
                setForm({
                  type: 'regular', date: '', time: '', guest_count: 2,
                  occasion: '', addons: [], sticker_text: '', guest_name: '', guest_phone: '',
                })
              }}
            >
              {t('booking.success.another')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── BOOKING FORM ──
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <CalendarHeart className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold">{cafe.name}</h1>
          <p className="text-sm text-brand-300 mt-1">{t('booking.title')}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-10">
        {/* Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-brand-200/50 mb-5">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1">
                <div className={cn(
                  'h-1.5 rounded-full transition-colors duration-300',
                  i < step ? 'bg-brand-600' : 'bg-brand-100'
                )} />
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-400 mt-2">{t('booking.step')} {step} {t('booking.of')} {totalSteps}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200/50 animate-fade-in">
          {/* Step 1: Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-900">{t('booking.type.heading')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => update('type', 'regular')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-start transition-all duration-200 cursor-pointer',
                    form.type === 'regular' ? 'border-brand-600 bg-brand-50' : 'border-brand-200 hover:border-brand-300'
                  )}
                >
                  <CalendarHeart className={cn('h-6 w-6 mb-2', form.type === 'regular' ? 'text-brand-600' : 'text-brand-400')} />
                  <p className="text-sm font-semibold text-brand-900">{t('booking.type.regular')}</p>
                  <p className="text-xs text-brand-500 mt-0.5">{t('booking.type.regular_sub')}</p>
                </button>
                <button
                  onClick={() => update('type', 'special')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-start transition-all duration-200 cursor-pointer',
                    form.type === 'special' ? 'border-gold bg-amber-50' : 'border-brand-200 hover:border-brand-300'
                  )}
                >
                  <Sparkles className={cn('h-6 w-6 mb-2', form.type === 'special' ? 'text-gold' : 'text-brand-400')} />
                  <p className="text-sm font-semibold text-brand-900">{t('booking.type.special')}</p>
                  <p className="text-xs text-brand-500 mt-0.5">{t('booking.type.special_sub')}</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date/Time/Guests */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-900">{t('booking.when.heading')}</h2>
              <Input
                label={t('booking.when.date')}
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1.5">{t('booking.when.time')}</label>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pe-1">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => update('time', slot)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                        form.time === slot ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1.5">{t('booking.when.guests')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update('guest_count', Math.max(1, form.guest_count - 1))}
                    className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 font-bold hover:bg-brand-200 transition-colors cursor-pointer"
                  >−</button>
                  <span className="text-lg font-semibold text-brand-900 w-8 text-center">{form.guest_count}</span>
                  <button
                    onClick={() => update('guest_count', Math.min(20, form.guest_count + 1))}
                    className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 font-bold hover:bg-brand-200 transition-colors cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Special Details */}
          {step === 3 && form.type === 'special' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-900">{t('booking.special_details.heading')}</h2>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1.5">{t('booking.special_details.occasion')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {occasions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => update('occasion', occ)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                        form.occasion === occ ? 'bg-gold text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                      )}
                    >
                      {t(`booking.occasions.${occ}`)}
                    </button>
                  ))}
                </div>
              </div>
              {addons.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1.5">{t('booking.special_details.addons')}</label>
                  <div className="space-y-2">
                    {addons.map((addon) => (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.name)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer text-start',
                          form.addons.includes(addon.name) ? 'border-gold bg-amber-50' : 'border-brand-200 hover:border-brand-300'
                        )}
                      >
                        <span className="text-sm text-brand-900">{addon.name}</span>
                        <span className="text-xs font-medium text-brand-500">{formatCurrency(addon.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Input
                label={t('booking.special_details.sticker_label')}
                placeholder={t('booking.special_details.sticker_placeholder')}
                value={form.sticker_text}
                onChange={(e) => update('sticker_text', e.target.value)}
              />
            </div>
          )}

          {/* Contact Info */}
          {((step === 3 && form.type === 'regular') || (step === 4 && form.type === 'special')) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-900">{t('booking.contact.heading')}</h2>
              <Input
                label={t('booking.contact.name')}
                placeholder={t('booking.contact.name_placeholder')}
                value={form.guest_name}
                onChange={(e) => update('guest_name', e.target.value)}
              />
              <Input
                label={t('booking.contact.phone')}
                type="tel"
                placeholder={t('booking.contact.phone_placeholder')}
                value={form.guest_phone}
                onChange={(e) => update('guest_phone', e.target.value)}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-brand-100">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> {t('booking.nav.back')}
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                {t('booking.nav.next')} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="gold" onClick={handleSubmit} loading={submitting} disabled={!canProceed()}>
                {t('booking.nav.confirm')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}