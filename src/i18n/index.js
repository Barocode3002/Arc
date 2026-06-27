import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ar from './locales/ar.json'

i18n
  .use(LanguageDetector)     // بيقرأ لغة الجهاز تلقائياً
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      cacheUserSelection: 'localStorage',
      lookupLocalStorage: 'arc_lang',
    },
    interpolation: { escapeValue: false },
  })

export default i18n