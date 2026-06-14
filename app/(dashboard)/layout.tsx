import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Single query: join user_roles + generators in one round-trip instead of two
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, generator_id, generators(name)')
    .eq('user_id', user.id)
    .single()

  const role = (roleData as { role: string; generator_id: string | null; generators: { name: string } | null } | null)
  const generatorName = role?.generators?.name ?? null

  return (
    <DashboardShell
      userEmail={user.email!}
      role={role?.role ?? ''}
      generatorName={generatorName}
    >
      {children}
    </DashboardShell>
  )
}
