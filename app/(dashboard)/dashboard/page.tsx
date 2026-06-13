import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/StatCard'
import { formatCurrency, formatMonthYear } from '@/lib/utils/format'
import type { UserRole, Subscriber, MonthlyPayment } from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null
  const generatorId = userRole?.generator_id

  type GeneratorInfo = { name: string; ampere_price: number }
  let generator: GeneratorInfo | null = null
  if (generatorId) {
    const { data: genData } = await supabase
      .from('generators')
      .select('name, ampere_price')
      .eq('id', generatorId)
      .single()
    generator = (genData as unknown) as GeneratorInfo | null
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  let subscribersQuery = supabase.from('subscribers').select('id, ampere_count, active')
  if (userRole?.role !== 'super_admin' && generatorId) {
    subscribersQuery = subscribersQuery.eq('generator_id', generatorId)
  }
  const { data: subsData } = await subscribersQuery
  const subscribers = (subsData as Pick<Subscriber, 'id' | 'ampere_count' | 'active'>[] | null) ?? []

  let paymentsQuery = supabase
    .from('monthly_payments')
    .select('id, is_paid, amount')
    .eq('year', currentYear)
    .eq('month', currentMonth)
  if (userRole?.role !== 'super_admin' && generatorId) {
    paymentsQuery = paymentsQuery.eq('generator_id', generatorId)
  }
  const { data: paymentsData } = await paymentsQuery
  const payments = (paymentsData as Pick<MonthlyPayment, 'id' | 'is_paid' | 'amount'>[] | null) ?? []

  const totalSubscribers = subscribers.length
  const activeSubscribers = subscribers.filter((s) => s.active).length
  const totalAmpere = subscribers.filter((s) => s.active).reduce((sum, s) => sum + Number(s.ampere_count), 0)
  const amperePrice = generator?.ampere_price ?? 0
  const expectedRevenue = totalAmpere * amperePrice
  const paidCount = payments.filter((p) => p.is_paid).length
  const unpaidCount = payments.length - paidCount
  const paidAmount = payments.filter((p) => p.is_paid).reduce((sum, p) => sum + Number(p.amount), 0)
  const unpaidAmount = payments.filter((p) => !p.is_paid).reduce((sum, p) => sum + Number(p.amount), 0)
  const isEarlyMonth = now.getDate() <= 5

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
        {generator && (
          <p className="text-slate-500 mt-1 text-sm">
            {generator.name} — سعر الأمبير: {formatCurrency(amperePrice)}
          </p>
        )}
      </div>

      {isEarlyMonth && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3 flex-wrap">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">بداية الشهر — وقت تحصيل الدفعات</p>
            <p className="text-amber-600 text-xs mt-0.5">
              الآن بين اليوم 1 و 5 من {formatMonthYear(currentMonth, currentYear)}.
            </p>
          </div>
          <a
            href="/payments"
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg shrink-0"
          >
            عرض الدفعات
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <StatCard title="إجمالي المشتركين" value={totalSubscribers} icon="◈" color="slate" />
        <StatCard title="المشتركون النشطون" value={activeSubscribers} icon="✓" color="blue" />
        <StatCard title="مجموع الأمبير" value={`${totalAmpere} A`} icon="⚡" color="amber" />
        <StatCard title="الإيراد الشهري المتوقع" value={formatCurrency(expectedRevenue)} icon="◎" color="green" />
      </div>

      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        دفعات {formatMonthYear(currentMonth, currentYear)}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <StatCard title="مدفوع" value={paidCount} subtitle={formatCurrency(paidAmount)} color="green" icon="✓" />
        <StatCard title="غير مدفوع" value={unpaidCount} subtitle={formatCurrency(unpaidAmount)} color="red" icon="✗" />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/subscribers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          <span>+</span> إضافة مشترك جديد
        </a>
        <a
          href="/payments"
          className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          عرض الدفعات الشهرية
        </a>
      </div>
    </div>
  )
}
