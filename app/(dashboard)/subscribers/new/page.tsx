import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriberForm } from '@/components/SubscriberForm'
import { createSubscriberAction } from '@/lib/actions/subscribers'

export default async function NewSubscriberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <div className="mb-6">
        <a href="/subscribers" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          ← العودة للمشتركين
        </a>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">إضافة مشترك جديد</h1>
        <p className="text-slate-500 text-sm mt-1">أدخل بيانات المشترك الجديد</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <SubscriberForm action={createSubscriberAction} />
      </div>
    </div>
  )
}
