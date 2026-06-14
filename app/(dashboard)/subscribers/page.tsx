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

  if (userRole?.role !== 'super_admin' && userRole?.generator_id)
    query = query.eq('generator_id', userRole.generator_id)
  if (status === 'active') query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)
  if (q) query = query.ilike('full_name', `%${q}%`)

  const { data: subsData } = await query
  const subscribers = (subsData as Subscriber[] | null) ?? []

  const activeCount = subscribers.filter(s => s.active).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المشتركون</h1>
          <p className="text-slate-500 text-sm mt-1">
            {subscribers.length} مشترك · {activeCount} نشط
          </p>
        </div>
        <Link
          href="/subscribers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          إضافة مشترك
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="بحث بالاسم..."
            className="w-full border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ''}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        >
          <option value="">جميع المشتركين</option>
          <option value="active">النشطون فقط</option>
          <option value="inactive">غير النشطين</option>
        </select>
        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          بحث
        </button>
        {(q || status) && (
          <a href="/subscribers" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-sm transition-colors">
            مسح
          </a>
        )}
      </form>

      {/* Empty state */}
      {subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="font-semibold text-slate-700">لا يوجد مشتركون</p>
          {!q && !status && (
            <Link href="/subscribers/new" className="mt-3 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
              إضافة أول مشترك ←
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الاسم</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الهاتف</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الأمبير</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">تاريخ الانضمام</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الحالة</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{sub.full_name}</p>
                      {sub.address && <p className="text-xs text-slate-400 mt-0.5">{sub.address}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{sub.phone_number ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z"/></svg>
                        {sub.ampere_count} A
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm">{formatDate(sub.join_date)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        sub.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {sub.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/subscribers/${sub.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          تعديل
                        </Link>
                        <DeleteButton
                          id={sub.id}
                          action={deleteSubscriberAction}
                          confirmMessage={`هل تريد حذف المشترك "${sub.full_name}"؟`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {subscribers.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">{sub.full_name}</p>
                    {sub.address && <p className="text-xs text-slate-400 mt-0.5">{sub.address}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                    sub.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {sub.active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  {sub.phone_number && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498A1 1 0 0 1 21 15.72V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/>
                      </svg>
                      {sub.phone_number}
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-lg text-xs">
                    ⚡ {sub.ampere_count} A
                  </span>
                  <span className="text-xs">{formatDate(sub.join_date)}</span>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Link href={`/subscribers/${sub.id}/edit`} className="flex-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-xl text-sm transition-colors">
                    تعديل
                  </Link>
                  <DeleteButton
                    id={sub.id}
                    action={deleteSubscriberAction}
                    confirmMessage={`هل تريد حذف المشترك "${sub.full_name}"؟`}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
