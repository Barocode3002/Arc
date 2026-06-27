import { Link } from 'react-router-dom'
import { QrCode, CalendarHeart, Sparkles, ArrowRight, Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    {
      icon: QrCode,
      key: 'qr_menu',
      color: 'bg-brand-600',
    },
    {
      icon: CalendarHeart,
      key: 'booking',
      color: 'bg-gold',
    },
    {
      icon: Sparkles,
      key: 'special',
      color: 'bg-brand-500',
    },
  ]
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-20 end-10 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <Coffee className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-medium text-brand-200">{t('home.hero.tagline')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              {t('home.hero.title_1')}{' '}
              <span className="text-gold">{t('home.hero.title_2')}</span>{' '}
              {t('home.hero.title_3')}
            </h1>

            <p className="mt-6 text-lg text-brand-300 leading-relaxed max-w-lg">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/arc-downtown/menu">
                <Button size="lg" variant="gold" className="w-full sm:w-auto">
                  {t('home.hero.cta_secondary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/arc-downtown/book">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto text-white border border-white/20 hover:bg-white/10">
                  {t('home.hero.cta_primary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-900">
            {t('home.features.heading')}
          </h2>
          <p className="mt-3 text-brand-500 max-w-lg mx-auto">
            {t('home.features.subheading')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.key}
              className={`bg-white rounded-2xl p-7 border border-brand-200/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in delay-${i + 1}`}
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-brand-900 mb-2">{t(`home.features.items.${feature.key}.title`)}</h3>
              <p className="text-sm text-brand-500 leading-relaxed">{t(`home.features.items.${feature.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-gold" />
              <span className="text-sm font-serif font-bold text-white">Arc.</span>
            </div>
            <p className="text-xs text-brand-500">{t('home.footer.copy')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
