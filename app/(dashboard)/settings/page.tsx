import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdatePriceForm } from '@/components/UpdatePriceForm'
import { formatCurrency } from '@/lib/utils/format'
import type { UserRole, Generator } from '@/lib/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null

  if (userRole?.role !== 'generator_admin') redirect('/dashboard')

  const { data: genData } = await supabase
    .from('generators')
    .select('id, name, ampere_price, created_at')
    .eq('id', userRole.generator_id!)
    .single()

  const generator = genData as Generator | null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إعدادات المولدة</h1>
        <p className="text-slate-500 text-sm mt-1">إدارة إعدادات مولدتك وتحديث سعر الأمبير</p>
      </div>

      {/* Generator info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{generator?.name ?? '—'}</h2>
            <p className="text-sm text-slate-500">معلومات المولدة</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">السعر الحالي للأمبير</p>
            <p className="text-xl font-bold text-slate-800">
              {generator ? formatCurrency(generator.ampere_price) : '—'}
            </p>
            <p className="text-xs text-slate-400 mt-1">شهرياً لكل أمبير</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">تاريخ إنشاء المولدة</p>
            <p className="text-base font-semibold text-slate-700">
              {generator ? new Date(generator.created_at).toLocaleDateString('ar-IQ') : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Update price form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">تحديث سعر الأمبير</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            سيُطبَّق السعر الجديد على الفواتير القادمة فقط — الدفعات السابقة لن تتأثر
          </p>
        </div>
        <div className="px-6 py-6">
          <UpdatePriceForm currentPrice={generator?.ampere_price ?? 0} />
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-amber-800 text-sm">تنبيه بشأن تغيير السعر</p>
          <p className="text-amber-700 text-sm mt-1">
            تغيير سعر الأمبير يؤثر فقط على الفواتير الجديدة التي لم تُنشأ بعد.
            الدفعات المسجّلة للأشهر الماضية تحتفظ بالسعر الذي كان سارياً وقت إنشائها.
          </p>
        </div>
      </div>
    </div>
  )
}
