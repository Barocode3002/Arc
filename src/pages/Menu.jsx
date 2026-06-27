import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Coffee, Flame, Star, Leaf, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { groupBy, formatCurrency, cn } from '../utils/helpers'
import Badge from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { menuBadgeVariant } from '../utils/helpers'

const badgeIcons = {
  bestseller: Flame,
  signature: Star,
  seasonal: Leaf,
}

export default function Menu() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [cafe, setCafe] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: cafeData } = await supabase
        .from('cafes')
        .select('*')
        .eq('slug', slug)
        .single()

      if (cafeData) {
        setCafe(cafeData)
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeData.id)
          .eq('is_available', true)
          .order('sort_order', { ascending: true })

        setItems(menuData || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const grouped = useMemo(() => groupBy(items, 'category'), [items])
  const categories = useMemo(() => Object.keys(grouped), [grouped])

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  const filteredItems = useMemo(() => {
    let list = activeCategory ? (grouped[activeCategory] || []) : items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, grouped, items, search])

  if (loading) return <PageSpinner />

  if (!cafe) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-brand-300 mx-auto mb-4" />
          <h1 className="text-xl font-serif font-bold text-brand-900">{t('menu.not_found')}</h1>
          <p className="text-sm text-brand-500 mt-2">{t('menu.not_found_desc')}</p>
        </div>
      </div>
    )
  }

  const menuUrl = `${window.location.origin}/${slug}/menu`

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold">{cafe.name}</h1>
          <p className="text-sm text-brand-300 mt-1">{t('menu.title')}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
          <input
            type="text"
            placeholder={t('menu.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl bg-white border border-brand-200 text-sm text-brand-900 placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mt-2">
          {filteredItems.map((item, i) => {
            const BadgeIcon = item.badge ? badgeIcons[item.badge] : null
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-4 border border-brand-200/50 shadow-sm animate-fade-in delay-${Math.min(i + 1, 4)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-brand-900 truncate">{item.name}</h3>
                      {item.badge && (
                        <Badge variant={menuBadgeVariant(item.badge)} className="shrink-0">
                          {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-brand-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-brand-700 whitespace-nowrap">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="h-10 w-10 text-brand-200 mx-auto mb-3" />
              <p className="text-sm text-brand-400">{t('menu.no_items')}</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="mt-10 bg-white rounded-2xl p-6 border border-brand-200/50 shadow-sm text-center">
          <h3 className="text-sm font-semibold text-brand-700 mb-3">{t('menu.share_title')}</h3>
          <div className="inline-block p-3 bg-white rounded-xl border border-brand-100">
            <QRCodeSVG value={menuUrl} size={120} fgColor="#2C1A0E" />
          </div>
          <p className="text-xs text-brand-400 mt-3">{t('menu.share_desc')}</p>
        </div>
      </div>
    </div>
  )
}
