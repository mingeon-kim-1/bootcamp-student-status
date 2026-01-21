'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import SettingsModal from '@/components/SettingsModal'

export default function AdminLoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const result = await signIn('admin-login', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(t('auth.invalidCredentials'))
      setLoading(false)
    } else {
      router.push(`/${locale}/admin/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col transition-colors">
      <header className="p-6 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
          ← {t('common.appName')}
        </Link>
        <SettingsModal />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('auth.adminLoginTitle')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-indigo-200 mb-2">
                  {t('auth.username')}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-indigo-200 mb-2">
                  {t('common.password')}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                {loading ? t('common.loading') : t('common.login')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
