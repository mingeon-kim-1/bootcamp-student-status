import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BrandingDisplay from '@/components/BrandingDisplay'
import PageHeader from '@/components/PageHeader'

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations()
  
  const branding = await prisma.branding.findUnique({
    where: { id: 'default' }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 flex flex-col transition-colors">
      {/* Header */}
      <PageHeader />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Branding */}
        <BrandingDisplay 
          imagePath={branding?.loginImagePath} 
          text={branding?.organizationName}
          type="login"
        />

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 text-center tracking-tight">
          {t('landing.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-indigo-200 mb-12 text-center max-w-xl">
          {t('landing.subtitle')}
        </p>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href={`/${locale}/admin/login`}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl text-center transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
          >
            {t('landing.adminLogin')}
          </Link>
          <Link
            href={`/${locale}/student/login`}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl text-center transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
          >
            {t('landing.studentLogin')}
          </Link>
        </div>

        <Link
          href={`/${locale}/student/signup`}
          className="mt-6 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white transition-colors underline underline-offset-4"
        >
          {t('landing.studentSignup')}
        </Link>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 dark:text-slate-500 text-sm">
        © 2024 Bootcamp Status Check
      </footer>
    </div>
  )
}
