'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

const DISMISSED_KEY = 'ios-install-dismissed'

export function IOSInstallBanner() {
  const { isIOS, isInstalled } = usePWA()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (
      isIOS &&
      !isInstalled &&
      !localStorage.getItem(DISMISSED_KEY)
    ) {
      // Wait a few seconds so it doesn't interrupt page load
      const t = setTimeout(() => setVisible(true), 4000)
      return () => clearTimeout(t)
    }
  }, [isIOS, isInstalled])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div
        dir="rtl"
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden
          animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">تثبيت التطبيق</p>
                <p className="text-xs text-slate-500">نظام المولدات</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">١</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  اضغط على زر{' '}
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg text-xs font-semibold text-slate-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    مشاركة
                  </span>
                  {' '}في شريط Safari
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">٢</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  اختر{' '}
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg text-xs font-semibold text-slate-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    أضف إلى الشاشة الرئيسية
                  </span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  ستجد التطبيق مباشرةً على شاشتك الرئيسية
                </p>
              </div>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="w-full py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            حسناً، شكراً
          </button>
        </div>
      </div>
    </>
  )
}
