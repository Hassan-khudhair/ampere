import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/Sidebar'
import type { UserRole, Generator } from '@/lib/types/database'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null

  let generatorName: string | null = null
  if (userRole?.generator_id) {
    const { data: genData } = await supabase
      .from('generators')
      .select('name')
      .eq('id', userRole.generator_id)
      .single()
    generatorName = (genData as Pick<Generator, 'name'> | null)?.name ?? null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        userEmail={user.email!}
        role={userRole?.role ?? ''}
        generatorName={generatorName}
      />
      <main className="mr-64 min-h-screen">
        <div className="p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
