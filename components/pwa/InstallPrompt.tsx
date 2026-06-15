'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

const DISMISSED_KEY = 'pwa-install-dismissed'

export function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWA()
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Show only on Android/Desktop Chrome, not iOS (iOS uses IOSInstallBanner)
    // and not when already installed or previously dismissed
    if (
      canInstall &&
      !isInstalled &&
      !isIOS &&
      !sessionStorage.getItem(DISMISSED_KEY)
    ) {
      // Small delay so it doesn't pop up the instant the page loads
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [canInstall, isInstalled, isIOS])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
    setVisible(false)
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:left-auto md:right-6 md:w-80 z-50
        bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-start gap-3
        animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* App icon */}
      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">تثبيت التطبيق</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          أضف التطبيق إلى شاشتك الرئيسية للوصول السريع بدون متصفح
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            {installing ? 'جاري التثبيت...' : 'تثبيت'}
          </button>
          <button
            onClick={dismiss}
            className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-100 transition-colors"
          >
            لاحقاً
          </button>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={dismiss}
        className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 -mt-1 -ml-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
