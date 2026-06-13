import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriberForm } from '@/components/SubscriberForm'
import { updateSubscriberAction } from '@/lib/actions/subscribers'
import type { Subscriber } from '@/lib/types/database'

export default async function EditSubscriberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subData } = await supabase
    .from('subscribers')
    .select('*')
    .eq('id', id)
    .single()

  const subscriber = subData as Subscriber | null
  if (!subscriber) notFound()

  return (
    <div>
      <div className="mb-6">
        <a href="/subscribers" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          ← العودة للمشتركين
        </a>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">تعديل بيانات المشترك</h1>
        <p className="text-slate-500 text-sm mt-1">{subscriber.full_name}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <SubscriberForm action={updateSubscriberAction} subscriber={subscriber} />
      </div>
    </div>
  )
}
