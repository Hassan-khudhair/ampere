import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/StatCard'
import { formatCurrency, formatMonthYear } from '@/lib/utils/format'
import type { UserRole, Subscriber, MonthlyPayment } from '@/lib/types/database'

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
)
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
  </svg>
)
const BanknoteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
  </svg>
)

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
  if (userRole?.role !== 'super_admin' && generatorId)
    subscribersQuery = subscribersQuery.eq('generator_id', generatorId)
  const { data: subsData } = await subscribersQuery
  const subscribers = (subsData as Pick<Subscriber, 'id' | 'ampere_count' | 'active'>[] | null) ?? []

  let paymentsQuery = supabase
    .from('monthly_payments')
    .select('id, is_paid, amount')
    .eq('year', currentYear)
    .eq('month', currentMonth)
  if (userRole?.role !== 'super_admin' && generatorId)
    paymentsQuery = paymentsQuery.eq('generator_id', generatorId)
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
  const collectionRate = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0
  const isEarlyMonth = now.getDate() <= 5

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-slate-500 text-sm mt-1">
            {formatMonthYear(currentMonth, currentYear)}
            {generator && ` · ${generator.name}`}
          </p>
        </div>
        <Link
          href="/subscribers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          مشترك جديد
        </Link>
      </div>

      {/* Early month alert */}
      {isEarlyMonth && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 1 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">بداية الشهر — وقت تحصيل الدفعات</p>
            <p className="text-amber-600 text-xs mt-0.5">أنت في اليوم {now.getDate()} من {formatMonthYear(currentMonth, currentYear)}</p>
          </div>
          <Link
            href="/payments"
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            عرض الدفعات
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المشتركين"
          value={totalSubscribers}
          subtitle={`${activeSubscribers} نشط`}
          color="slate"
          icon={<UsersIcon />}
        />
        <StatCard
          title="المشتركون النشطون"
          value={activeSubscribers}
          color="blue"
          icon={<CheckIcon />}
        />
        <StatCard
          title="مجموع الأمبير"
          value={`${totalAmpere} A`}
          subtitle={generator ? `${formatCurrency(amperePrice)} / أمبير` : undefined}
          color="amber"
          icon={<BoltIcon />}
        />
        <StatCard
          title="الإيراد المتوقع"
          value={formatCurrency(expectedRevenue)}
          color="green"
          icon={<BanknoteIcon />}
        />
      </div>

      {/* Payment summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">دفعات {formatMonthYear(currentMonth, currentYear)}</h2>
          <Link href="/payments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            عرض الكل ←
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>نسبة التحصيل</span>
            <span className="font-semibold text-slate-700">{collectionRate}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-l from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">{payments.length}</p>
            <p className="text-xs text-slate-500 mt-1">إجمالي</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(paidAmount + unpaidAmount)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{paidCount}</p>
            <p className="text-xs text-emerald-600 mt-1">مدفوع</p>
            <p className="text-xs text-emerald-500 mt-0.5">{formatCurrency(paidAmount)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{unpaidCount}</p>
            <p className="text-xs text-red-600 mt-1">متبقي</p>
            <p className="text-xs text-red-400 mt-0.5">{formatCurrency(unpaidAmount)}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/subscribers"
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 transition-colors group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">المشتركون</p>
            <p className="text-xs text-slate-500 mt-0.5">{totalSubscribers} مشترك</p>
          </div>
        </Link>
        <Link
          href="/payments"
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 transition-colors group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path strokeLinecap="round" d="M1 10h22" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">الدفعات</p>
            <p className="text-xs text-slate-500 mt-0.5">{collectionRate}% تم التحصيل</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
