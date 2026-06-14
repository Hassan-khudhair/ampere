import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensurePaymentsForMonth } from '@/lib/actions/payments'
import { PaymentToggle } from '@/components/PaymentToggle'
import { MonthSelector } from '@/components/MonthSelector'
import { ExportButton } from '@/components/ExportButton'
import { formatCurrency, formatMonthYear } from '@/lib/utils/format'
import type { UserRole, Generator, MonthlyPayment, Subscriber } from '@/lib/types/database'

interface PaymentRow extends MonthlyPayment {
  subscribers: Pick<Subscriber, 'id' | 'full_name' | 'ampere_count' | 'phone_number' | 'active'>
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? '') || now.getFullYear()
  const month = parseInt(params.month ?? '') || now.getMonth() + 1

  await ensurePaymentsForMonth(year, month)

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null
  const generatorId = userRole?.generator_id

  let generatorName: string | null = null
  if (generatorId) {
    const { data: genData } = await supabase
      .from('generators').select('name').eq('id', generatorId).single()
    generatorName = (genData as Pick<Generator, 'name'> | null)?.name ?? null
  }

  let query = supabase
    .from('monthly_payments')
    .select('*, subscribers(id, full_name, ampere_count, phone_number, active)')
    .eq('year', year).eq('month', month)
    .order('created_at', { ascending: true })

  if (userRole?.role !== 'super_admin' && generatorId)
    query = query.eq('generator_id', generatorId)

  const { data: paymentsData } = await query
  const payments = (paymentsData as PaymentRow[] | null) ?? []
  const activePayments = payments.filter((p) => p.subscribers?.active !== false)

  const paidPayments = activePayments.filter((p) => p.is_paid)
  const unpaidPayments = activePayments.filter((p) => !p.is_paid)
  const totalExpected = activePayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const collectionRate = activePayments.length > 0 ? Math.round((paidPayments.length / activePayments.length) * 100) : 0

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const isEarlyMonth = isCurrentMonth && now.getDate() <= 5

  const exportRows = activePayments.map(p => ({
    subscriberName: p.subscribers?.full_name ?? '',
    phone: p.subscribers?.phone_number ?? null,
    ampere: Number(p.subscribers?.ampere_count ?? 0),
    amount: Number(p.amount),
    isPaid: p.is_paid,
    isProrated: p.is_prorated,
    daysInPeriod: p.days_in_period,
    totalDaysInMonth: p.total_days_in_month,
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الدفعات الشهرية</h1>
          <p className="text-slate-500 text-sm mt-1">
            {formatMonthYear(month, year)}
            {generatorName && ` · ${generatorName}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector year={year} month={month} />
          {activePayments.length > 0 && (
            <ExportButton
              rows={exportRows}
              month={month}
              year={year}
              generatorName={generatorName}
              totalExpected={totalExpected}
              totalPaid={totalPaid}
              totalUnpaid={totalUnpaid}
              paidCount={paidPayments.length}
              unpaidCount={unpaidPayments.length}
            />
          )}
        </div>
      </div>

      {isEarlyMonth && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-blue-800 text-sm">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          أنت في بداية الشهر — الوقت المناسب لتسجيل الدفعات.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-800">{activePayments.length}</p>
          <p className="text-xs text-slate-500 mt-1">إجمالي</p>
          <p className="text-xs font-medium text-slate-600 mt-1">{formatCurrency(totalExpected)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-emerald-700">{paidPayments.length}</p>
          <p className="text-xs text-emerald-600 mt-1">مدفوع</p>
          <p className="text-xs font-medium text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-700">{unpaidPayments.length}</p>
          <p className="text-xs text-red-500 mt-1">متبقي</p>
          <p className="text-xs font-medium text-red-600 mt-1">{formatCurrency(totalUnpaid)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>نسبة التحصيل</span>
          <span className="font-bold text-slate-700">{collectionRate}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-l from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {activePayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-14 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2"/><path strokeLinecap="round" d="M1 10h22"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700">لا توجد دفعات لهذا الشهر</p>
          <p className="text-sm text-slate-400 mt-1">أضف مشتركين أولاً من صفحة المشتركين</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">المشترك</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الأمبير</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">المبلغ</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">ملاحظة</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activePayments.map((payment) => {
                  const sub = payment.subscribers
                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{sub?.full_name}</p>
                        {sub?.phone_number && <p className="text-xs text-slate-400 mt-0.5">{sub.phone_number}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          ⚡ {sub?.ampere_count} A
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="px-5 py-4">
                        {payment.is_prorated ? (
                          <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                            مقسّط · {payment.days_in_period}/{payment.total_days_in_month} يوم
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">شهر كامل</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentToggle paymentId={payment.id} isPaid={payment.is_paid} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {activePayments.map((payment) => {
              const sub = payment.subscribers
              return (
                <div key={payment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-slate-800">{sub?.full_name}</p>
                      {sub?.phone_number && <p className="text-xs text-slate-400 mt-0.5">{sub.phone_number}</p>}
                    </div>
                    <p className="font-bold text-slate-800 shrink-0">{formatCurrency(Number(payment.amount))}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      ⚡ {sub?.ampere_count} A
                    </span>
                    {payment.is_prorated && (
                      <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-lg">
                        مقسّط · {payment.days_in_period}/{payment.total_days_in_month} يوم
                      </span>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <PaymentToggle paymentId={payment.id} isPaid={payment.is_paid} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
