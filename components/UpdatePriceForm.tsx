'use client'

import { useState, useTransition } from 'react'
import { updateAmperePriceAction } from '@/lib/actions/admin'
import type { AdminState } from '@/lib/actions/admin'

interface Props {
  currentPrice: number
}

export function UpdatePriceForm({ currentPrice }: Props) {
  const [state, setState] = useState<AdminState | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setState(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateAmperePriceAction(null, formData)
      setState(result)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          {state.success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          السعر الجديد للأمبير (دينار عراقي)
        </label>
        <div className="relative">
          <input
            type="number"
            name="ampere_price"
            required
            min="0"
            step="500"
            defaultValue={currentPrice}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            placeholder="مثال: 15000"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">د.ع</span>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">السعر الحالي: {currentPrice.toLocaleString('ar-IQ')} د.ع</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        {pending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            جاري الحفظ...
          </>
        ) : 'حفظ السعر الجديد'}
      </button>
    </form>
  )
}
