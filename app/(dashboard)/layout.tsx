import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/DashboardShell'
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
    <DashboardShell
      userEmail={user.email!}
      role={userRole?.role ?? ''}
      generatorName={generatorName}
    >
      {children}
    </DashboardShell>
  )
}
