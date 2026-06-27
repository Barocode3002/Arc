import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/helpers'
import LanguageToggle from '../ui/LanguageToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  const navLinks = [
    { to: '/',                    label: t('nav.home',  'Home') },
    { to: '/arc-downtown/menu',   label: t('nav.menu',  'Menu') },
    { to: '/arc-downtown/book',   label: t('nav.book',  'Book a Table') },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-200/40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center shadow-sm group-hover:bg-brand-800 transition-colors">
              <Coffee className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-brand-900 tracking-tight">Arc.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(link.to)
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-brand-500 hover:text-brand-800 hover:bg-brand-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle — always visible */}
            <LanguageToggle />

            {/* Book CTA — desktop only */}
            <Link
              to="/arc-downtown/book"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium transition-colors shadow-sm"
            >
              {t('nav.book')}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-brand-100 animate-fade-in">
            <div className="space-y-0.5 mb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.to)
                      ? 'bg-brand-100 text-brand-800'
                      : 'text-brand-500 hover:bg-brand-50 hover:text-brand-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Book CTA */}
            <div className="pt-2 border-t border-brand-100">
              <Link
                to="/arc-downtown/book"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium transition-colors"
              >
                {t('nav.book')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}