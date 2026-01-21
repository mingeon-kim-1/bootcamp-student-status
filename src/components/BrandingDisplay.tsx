'use client'

import Image from 'next/image'

interface BrandingDisplayProps {
  imagePath?: string | null
  text?: string | null
  type: 'login' | 'display'
}

export default function BrandingDisplay({ imagePath, text, type }: BrandingDisplayProps) {
  if (!imagePath && !text) return null

  if (type === 'login') {
    return (
      <div className="mb-8 flex flex-col items-center">
        {imagePath && (
          <div className="relative w-48 h-24 mb-4">
            <Image
              src={imagePath}
              alt="Organization Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
        {text && !imagePath && (
          <h2 className="text-2xl font-bold text-indigo-300 mb-2">{text}</h2>
        )}
      </div>
    )
  }

  // Display type - for status display screen
  return (
    <div className="flex items-center gap-4">
      {imagePath && (
        <div className="relative w-16 h-16">
          <Image
            src={imagePath}
            alt="Organization Logo"
            fill
            className="object-contain"
          />
        </div>
      )}
      {text && (
        <span className="text-xl font-semibold text-white">{text}</span>
      )}
    </div>
  )
}
