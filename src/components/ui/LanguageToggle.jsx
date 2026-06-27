import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

/**
 * Drop this anywhere — Navbar, Admin Sidebar, wherever.
 * Switches between Arabic ↔ English and persists to localStorage.
 */
export default function LanguageToggle({ compact = false }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language?.startsWith('ar')

  const toggle = () => i18n.changeLanguage(isAr ? 'en' : 'ar')

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isAr ? 'Switch to English' : 'التبديل للعربية'}
        className="w-9 h-9 rounded-lg border border-brand-200 hover:bg-brand-50 flex items-center justify-center transition-colors"
      >
        <Languages className="h-4 w-4 text-brand-600" />
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50 text-sm font-medium text-brand-700 transition-colors"
    >
      <Languages className="h-4 w-4" />
      <span>{isAr ? 'English' : 'عربي'}</span>
    </button>
  )
}