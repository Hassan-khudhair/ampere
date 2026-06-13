import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensurePaymentsForMonth } from '@/lib/actions/payments'
import { PaymentToggle } from '@/components/PaymentToggle'
import { MonthSelector } from '@/components/MonthSelector'
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
      .from('generators')
      .select('name')
      .eq('id', generatorId)
      .single()
    generatorName = (genData as Pick<Generator, 'name'> | null)?.name ?? null
  }

  let query = supabase
    .from('monthly_payments')
    .select('*, subscribers(id, full_name, ampere_count, phone_number, active)')
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { ascending: true })

  if (userRole?.role !== 'super_admin' && generatorId) {
    query = query.eq('generator_id', generatorId)
  }

  const { data: paymentsData } = await query
  const payments = (paymentsData as PaymentRow[] | null) ?? []

  const activePayments = payments.filter((p) => p.subscribers?.active !== false)

  const paidPayments = activePayments.filter((p) => p.is_paid)
  const unpaidPayments = activePayments.filter((p) => !p.is_paid)
  const totalExpected = activePayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const isEarlyMonth = isCurrentMonth && now.getDate() <= 5

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الدفعات الشهرية</h1>
          <p className="text-slate-500 text-sm mt-1">
            {formatMonthYear(month, year)}
            {generatorName && ` — ${generatorName}`}
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      {isEarlyMonth && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800 flex items-center gap-2">
          <span>🔔</span>
          <span>أنت في بداية الشهر — الوقت المناسب لتسجيل الدفعات.</span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">الإجمالي المتوقع</p>
          <p className="text-lg font-bold text-slate-700">{formatCurrency(totalExpected)}</p>
          <p className="text-xs text-slate-400">{activePayments.length} مشترك</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600 mb-1">تم التحصيل</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-green-500">{paidPayments.length} مشترك</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-xs text-red-600 mb-1">متبقي</p>
          <p className="text-lg font-bold text-red-700">{formatCurrency(totalUnpaid)}</p>
          <p className="text-xs text-red-400">{unpaidPayments.length} مشترك</p>
        </div>
      </div>

      {activePayments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <p className="text-4xl mb-3">◎</p>
          <p className="font-medium">لا توجد دفعات لهذا الشهر</p>
          <p className="text-sm mt-1">أضف مشتركين أولاً من صفحة المشتركين</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">المشترك</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الأمبير</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">ملاحظة</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {activePayments.map((payment) => {
                  const sub = payment.subscribers
                  return (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{sub?.full_name}</p>
                        {sub?.phone_number && (
                          <p className="text-xs text-slate-400">{sub.phone_number}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{sub?.ampere_count} A</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {payment.is_prorated ? (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            مقسّط ({payment.days_in_period}/{payment.total_days_in_month} يوم)
                          </span>
                        ) : (
                          <span className="text-slate-400">شهر كامل</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentToggle paymentId={payment.id} isPaid={payment.is_paid} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
