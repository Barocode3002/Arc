import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Lock, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import LanguageToggle from '../../components/ui/LanguageToggle'

export default function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(username, password)
      navigate('/admin') // Redirect to dashboard on success
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-brand-900 p-3 rounded-2xl shadow-lg">
            <Coffee className="h-10 w-10 text-brand-50" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-brand-900">
          {t('admin.login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-brand-600">
          {t('admin.login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-brand-200/60 sm:rounded-2xl sm:px-10">
          <div className="flex justify-end mb-4">
            <LanguageToggle />
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <Input
              label={t('admin.login.username')}
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('admin.login.username_placeholder')}
            />

            <div className="relative">
              <Input
                label={t('admin.login.password')}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('admin.login.password_placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-9 text-brand-400 hover:text-brand-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-3"
              disabled={loading}
            >
              {loading ? t('admin.login.authenticating') : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> {t('admin.login.sign_in')}
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
