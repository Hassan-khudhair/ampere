import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/DeleteButton'
import { deleteSubscriberAction } from '@/lib/actions/subscribers'
import { formatDate } from '@/lib/utils/format'
import type { UserRole, Subscriber } from '@/lib/types/database'

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null
  const { q, status } = await searchParams

  let query = supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (userRole?.role !== 'super_admin' && userRole?.generator_id) {
    query = query.eq('generator_id', userRole.generator_id)
  }
  if (status === 'active') query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)
  if (q) query = query.ilike('full_name', `%${q}%`)

  const { data: subsData } = await query
  const subscribers = (subsData as Subscriber[] | null) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">المشتركون</h1>
          <p className="text-slate-500 text-sm mt-1">{subscribers.length} مشترك</p>
        </div>
        <Link
          href="/subscribers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          <span className="text-base">+</span> إضافة مشترك
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="بحث بالاسم..."
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-50"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">جميع المشتركين</option>
          <option value="active">النشطون فقط</option>
          <option value="inactive">غير النشطين</option>
        </select>
        <button
          type="submit"
          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          بحث
        </button>
        {(q || status) && (
          <a
            href="/subscribers"
            className="border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm"
          >
            إعادة تعيين
          </a>
        )}
      </form>

      {subscribers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-medium">لا يوجد مشتركون</p>
          {!q && !status && (
            <Link href="/subscribers/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              إضافة أول مشترك
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الاسم</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الهاتف</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الأمبير</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">تاريخ الانضمام</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 !== 0 ? 'bg-slate-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {sub.full_name}
                      {sub.address && (
                        <p className="text-xs text-slate-400 font-normal mt-0.5">{sub.address}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sub.phone_number ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{sub.ampere_count} A</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(sub.join_date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/subscribers/${sub.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          تعديل
                        </Link>
                        <DeleteButton
                          id={sub.id}
                          action={deleteSubscriberAction}
                          confirmMessage={`هل تريد حذف المشترك "${sub.full_name}"؟ سيتم حذف جميع سجلات دفعاته أيضاً.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
