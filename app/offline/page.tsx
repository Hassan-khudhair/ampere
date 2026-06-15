'use client'

import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false)
  const [online, setOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  // Auto-redirect when connection is restored
  useEffect(() => {
    if (online) window.location.href = '/dashboard'
  }, [online])

  async function handleRetry() {
    setRetrying(true)
    try {
      const res = await fetch('/manifest.json', { cache: 'no-store' })
      if (res.ok) {
        window.location.href = '/dashboard'
        return
      }
    } catch {
      // still offline
    }
    setRetrying(false)
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
      dir="rtl"
    >
      {/* Icon */}
      <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M8.111 8.111A5.993 5.993 0 006 12a6 6 0 006 6 5.993 5.993 0 003.889-1.445M15.5 9.5A5.974 5.974 0 0118 12m0 0a6 6 0 01-6 6m6-6H6"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.344 5.644A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-.644 3.536M2 12C2 6.477 6.477 2 12 2m0 0L2 22"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        لا يوجد اتصال بالإنترنت
      </h1>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs">
        تحقق من اتصالك بالشبكة ثم حاول مرة أخرى.
        <br />
        البيانات المحفوظة مسبقاً لا تزال متاحة.
      </p>

      <button
        onClick={handleRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors"
      >
        {retrying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            جاري الاتصال...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            إعادة المحاولة
          </>
        )}
      </button>

      {/* Status pill */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        غير متصل
      </div>
    </div>
  )
}
