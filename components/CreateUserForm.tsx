'use client'

import { useActionState, useState } from 'react'
import { createUserAction } from '@/lib/actions/admin'
import type { AdminState } from '@/lib/actions/admin'

export default function CreateUserForm() {
  const [state, formAction, pending] = useActionState<AdminState | null, FormData>(
    createUserAction,
    null
  )
  const [role, setRole] = useState<'generator_admin' | 'super_admin'>('generator_admin')

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {state.success}
        </div>
      )}

      {/* Role selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحساب</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="generator_admin"
              checked={role === 'generator_admin'}
              onChange={() => setRole('generator_admin')}
              className="text-blue-600"
            />
            <span className="text-sm">مشرف مولدة</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="super_admin"
              checked={role === 'super_admin'}
              onChange={() => setRole('super_admin')}
              className="text-blue-600"
            />
            <span className="text-sm">مشرف عام</span>
          </label>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="example@email.com"
          dir="ltr"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="6 أحرف على الأقل"
          dir="ltr"
        />
      </div>

      {/* Generator fields — only for generator_admin */}
      {role === 'generator_admin' && (
        <>
          <div>
            <label htmlFor="generator_name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم المولدة
            </label>
            <input
              id="generator_name"
              name="generator_name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: مولدة الحي الجنوبي"
            />
          </div>

          <div>
            <label htmlFor="ampere_price" className="block text-sm font-medium text-gray-700 mb-1">
              سعر الأمبير الشهري (دينار)
            </label>
            <input
              id="ampere_price"
              name="ampere_price"
              type="number"
              required
              min="0"
              step="500"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: 10000"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
      >
        {pending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
      </button>
    </form>
  )
}
