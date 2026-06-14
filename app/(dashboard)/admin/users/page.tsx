import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import CreateUserForm from '@/components/CreateUserForm'
import DeleteUserButton from '@/components/DeleteUserButton'
import { formatCurrency } from '@/lib/utils/format'
import type { UserRole, Generator } from '@/lib/types/database'

interface UserRoleWithGenerator extends UserRole {
  generator?: Generator | null
}

interface UserRow {
  id: string
  email: string
  created_at: string
  role: UserRoleWithGenerator | null
}

export default async function AdminUsersPage() {
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  // Direct REST call to Admin API — more reliable than SDK auth.admin in Server Components
  type AuthUser = { id: string; email?: string; created_at: string }
  let authUsers: AuthUser[] = []
  let dataError: string | null = null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?per_page=1000`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )
    if (res.ok) {
      const json = await res.json()
      authUsers = (json?.users ?? []) as AuthUser[]
    } else {
      dataError = `تعذّر جلب المستخدمين (${res.status})`
    }
  } catch (e) {
    dataError = `خطأ في الاتصال: ${String(e)}`
  }

  const { data: rolesData, error: rolesError } = await adminClient
    .from('user_roles')
    .select('user_id, role, generator_id, id, created_at')

  if (rolesError && !dataError) dataError = `خطأ في صلاحيات الجدول: ${rolesError.message}`

  const roles = (rolesData ?? []) as UserRole[]

  const generatorIds = roles
    .map(r => r.generator_id)
    .filter((id): id is string => !!id)

  let generators: Generator[] = []
  if (generatorIds.length > 0) {
    const { data: genData } = await adminClient
      .from('generators')
      .select('id, name, ampere_price, created_at')
      .in('id', generatorIds)
    generators = (genData ?? []) as Generator[]
  }

  const users: UserRow[] = authUsers.map(u => {
    const roleRecord = roles.find(r => r.user_id === u.id) ?? null
    let roleWithGen: UserRoleWithGenerator | null = null
    if (roleRecord) {
      const gen = roleRecord.generator_id
        ? generators.find(g => g.id === roleRecord.generator_id) ?? null
        : null
      roleWithGen = { ...roleRecord, generator: gen }
    }
    return {
      id: u.id,
      email: u.email ?? '—',
      created_at: u.created_at,
      role: roleWithGen,
    }
  })

  users.sort((a, b) => {
    const aSuper = a.role?.role === 'super_admin' ? 0 : 1
    const bSuper = b.role?.role === 'super_admin' ? 0 : 1
    if (aSuper !== bSuper) return aSuper - bSuper
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const superAdminCount = users.filter(u => u.role?.role === 'super_admin').length
  const generatorAdminCount = users.filter(u => u.role?.role === 'generator_admin').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
        <p className="text-slate-500 text-sm mt-1">
          {superAdminCount} مشرف عام · {generatorAdminCount} مشرف مولدة
        </p>
      </div>

      {dataError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          <div>
            <p className="font-semibold text-red-800 text-sm">فشل تحميل البيانات</p>
            <p className="text-red-700 text-xs mt-1 font-mono">{dataError}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-slate-800">{users.length}</p>
          <p className="text-sm text-slate-500 mt-1">إجمالي المستخدمين</p>
        </div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-purple-700">{superAdminCount}</p>
          <p className="text-sm text-purple-600 mt-1">مشرف عام</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-emerald-700">{generatorAdminCount}</p>
          <p className="text-sm text-emerald-600 mt-1">مشرف مولدة</p>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">المستخدمون الحاليون</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{users.length}</span>
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600">المستخدم</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600">الدور</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600">المولدة</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600">تاريخ الإنشاء</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => {
                    const isSuperAdmin = user.role?.role === 'super_admin'
                    const isMe = user.id === me?.id
                    return (
                      <tr key={user.id} className={`transition-colors ${isMe ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              isSuperAdmin
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800" dir="ltr">{user.email}</p>
                              {isMe && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">أنت</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isSuperAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuperAdmin ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                            {isSuperAdmin ? 'مشرف عام' : 'مشرف مولدة'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {user.role?.generator ? (
                            <div>
                              <p className="font-medium text-slate-700">{user.role.generator.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatCurrency(user.role.generator.ampere_price)} / أمبير
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-sm" dir="ltr">
                          {new Date(user.created_at).toLocaleDateString('ar-IQ')}
                        </td>
                        <td className="px-5 py-4">
                          {!isMe ? (
                            <DeleteUserButton userId={user.id} userEmail={user.email} />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map(user => {
                const isSuperAdmin = user.role?.role === 'super_admin'
                const isMe = user.id === me?.id
                return (
                  <div key={user.id} className={`p-4 ${isMe ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-slate-800 truncate" dir="ltr">{user.email}</p>
                          {isMe && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">أنت</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isSuperAdmin ? 'مشرف عام' : 'مشرف مولدة'}
                          </span>
                          {user.role?.generator && (
                            <span className="text-xs text-slate-500">{user.role.generator.name}</span>
                          )}
                        </div>
                      </div>
                      {!isMe && <DeleteUserButton userId={user.id} userEmail={user.email} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Create user form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">إنشاء حساب جديد</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            أنشئ حساب مشرف عام أو أضف مولدة جديدة مع مشرفها
          </p>
        </div>
        <div className="px-6 py-6 max-w-md">
          <CreateUserForm />
        </div>
      </div>
    </div>
  )
}
