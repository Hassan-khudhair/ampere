'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Subscriber } from '@/lib/types/database'

interface SubscriberFormProps {
  action: (formData: FormData) => Promise<{ error?: string } | null>
  subscriber?: Subscriber
  cancelHref?: string
}

export function SubscriberForm({ action, subscriber, cancelHref = '/subscribers' }: SubscriberFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/subscribers')
        router.refresh()
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {subscriber && <input type="hidden" name="id" value={subscriber.id} />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            defaultValue={subscriber?.full_name}
            placeholder="أدخل الاسم الكامل"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">رقم الهاتف</label>
          <input
            type="tel"
            name="phone_number"
            defaultValue={subscriber?.phone_number ?? ''}
            placeholder="07XX XXX XXXX"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Ampere Count */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            عدد الأمبير <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="ampere_count"
            required
            min="0.5"
            step="0.5"
            defaultValue={subscriber?.ampere_count}
            placeholder="5"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">العنوان</label>
          <input
            type="text"
            name="address"
            defaultValue={subscriber?.address ?? ''}
            placeholder="المنطقة، الشارع، رقم المنزل"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Join Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            تاريخ الانضمام <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="join_date"
            required
            defaultValue={subscriber?.join_date ?? today}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="_active_checkbox"
                id="active_checkbox"
                defaultChecked={subscriber?.active ?? true}
                className="sr-only peer"
                onChange={(e) => {
                  const hidden = document.getElementById('active_hidden') as HTMLInputElement
                  if (hidden) hidden.value = e.target.checked ? 'true' : 'false'
                }}
              />
              <div className="w-11 h-6 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
              <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:-translate-x-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">مشترك نشط</span>
          </label>
          <input
            type="hidden"
            name="active"
            id="active_hidden"
            defaultValue={subscriber?.active !== false ? 'true' : 'false'}
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ملاحظات</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={subscriber?.notes ?? ''}
            placeholder="أي ملاحظات إضافية..."
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 sm:flex-none sm:min-w-30 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2"
        >
          {pending && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {pending ? 'جاري الحفظ...' : (subscriber ? 'حفظ التعديلات' : 'إضافة المشترك')}
        </button>
        <a
          href={cancelHref}
          className="flex-1 sm:flex-none sm:min-w-25 text-center border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          إلغاء
        </a>
      </div>
    </form>
  )
}
