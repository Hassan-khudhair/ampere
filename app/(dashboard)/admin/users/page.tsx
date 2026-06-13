import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import CreateUserForm from '@/components/CreateUserForm'
import DeleteUserButton from '@/components/DeleteUserButton'
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

  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers()

  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('user_id, role, generator_id')

  const roles = (rolesData ?? []) as UserRole[]

  const generatorIds = roles
    .map(r => r.generator_id)
    .filter((id): id is string => !!id)

  let generators: Generator[] = []
  if (generatorIds.length > 0) {
    const { data: genData } = await supabase
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-sm text-gray-500 mt-1">
          {superAdminCount} مشرف عام · {generatorAdminCount} مشرف مولدة
        </p>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">المستخدمون الحاليون</h2>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-10">لا يوجد مستخدمون</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="px-6 py-3 text-right font-medium">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right font-medium">الدور</th>
                  <th className="px-6 py-3 text-right font-medium">المولدة</th>
                  <th className="px-6 py-3 text-right font-medium">سعر الأمبير</th>
                  <th className="px-6 py-3 text-right font-medium">تاريخ الإنشاء</th>
                  <th className="px-6 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => {
                  const isSuperAdmin = user.role?.role === 'super_admin'
                  const isMe = user.id === me?.id
                  return (
                    <tr key={user.id} className={isMe ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 font-medium text-gray-900" dir="ltr">
                        {user.email}
                        {isMe && (
                          <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            أنت
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isSuperAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isSuperAdmin ? 'مشرف عام' : 'مشرف مولدة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.role?.generator?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.role?.generator
                          ? `${user.role.generator.ampere_price.toLocaleString('ar-IQ')} د.ع`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 tabular-nums" dir="ltr">
                        {new Date(user.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4">
                        {!isMe ? (
                          <DeleteUserButton userId={user.id} userEmail={user.email} />
                        ) : (
                          <span className="text-gray-300 text-xs select-none">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">إنشاء حساب جديد</h2>
          <p className="text-sm text-gray-500 mt-0.5">
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
