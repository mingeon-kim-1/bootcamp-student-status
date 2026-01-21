'use client'

import Link from 'next/link'
import SettingsModal from './SettingsModal'

interface PageHeaderProps {
  backLink?: string
  backText?: string
}

export default function PageHeader({ backLink, backText }: PageHeaderProps) {
  return (
    <header className="p-6 flex justify-between items-center">
      {backLink && backText ? (
        <Link 
          href={backLink} 
          className="text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
        >
          ← {backText}
        </Link>
      ) : (
        <div />
      )}
      <SettingsModal />
    </header>
  )
}
