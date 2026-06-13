'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateMonthlyBilling, subscriberIsEligibleForMonth } from '@/lib/utils/billing'
import type { UserRole, Generator, Subscriber } from '@/lib/types/database'

export interface SubscriberState {
  error?: string
}

async function getGeneratorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_roles')
    .select('generator_id, role')
    .eq('user_id', user.id)
    .single()

  return (data as UserRole | null)?.generator_id ?? null
}

export async function createSubscriberAction(
  _prevState: SubscriberState | null,
  formData: FormData
): Promise<SubscriberState | null> {
  const supabase = await createClient()
  const generatorId = await getGeneratorId(supabase)
  if (!generatorId) return { error: 'غير مصرح' }

  const full_name = (formData.get('full_name') as string)?.trim()
  const phone_number = (formData.get('phone_number') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const ampere_count = parseFloat(formData.get('ampere_count') as string)
  const join_date = formData.get('join_date') as string
  const notes = (formData.get('notes') as string)?.trim() || null
  const active = formData.get('active') === 'true'

  if (!full_name) return { error: 'الاسم الكامل مطلوب' }
  if (isNaN(ampere_count) || ampere_count <= 0) return { error: 'عدد الأمبير يجب أن يكون أكبر من صفر' }
  if (!join_date) return { error: 'تاريخ الانضمام مطلوب' }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .insert({ generator_id: generatorId, full_name, phone_number, address, ampere_count, join_date, notes, active })
    .select()
    .single()

  if (error || !subscriber) return { error: 'فشل إضافة المشترك' }

  const sub = subscriber as Subscriber

  const { data: genData } = await supabase
    .from('generators')
    .select('ampere_price')
    .eq('id', generatorId)
    .single()

  const generator = genData as Pick<Generator, 'ampere_price'> | null

  if (generator) {
    const joinDate = new Date(join_date)
    const year = joinDate.getFullYear()
    const month = joinDate.getMonth() + 1
    const billing = calculateMonthlyBilling(join_date, year, month, ampere_count, generator.ampere_price)
    const daysInMonth = new Date(year, month, 0).getDate()

    await supabase.from('monthly_payments').insert({
      subscriber_id: sub.id,
      generator_id: generatorId,
      year,
      month,
      amount: billing.amount,
      ampere_price_snapshot: generator.ampere_price,
      is_paid: false,
      is_prorated: billing.isProrated,
      days_in_period: billing.daysInPeriod,
      total_days_in_month: daysInMonth,
    })
  }

  revalidatePath('/subscribers')
  revalidatePath('/payments')
  revalidatePath('/')
  redirect('/subscribers')
}

export async function updateSubscriberAction(
  _prevState: SubscriberState | null,
  formData: FormData
): Promise<SubscriberState | null> {
  const supabase = await createClient()
  const generatorId = await getGeneratorId(supabase)
  if (!generatorId) return { error: 'غير مصرح' }

  const id = formData.get('id') as string
  const full_name = (formData.get('full_name') as string)?.trim()
  const phone_number = (formData.get('phone_number') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const ampere_count = parseFloat(formData.get('ampere_count') as string)
  const join_date = formData.get('join_date') as string
  const notes = (formData.get('notes') as string)?.trim() || null
  const active = formData.get('active') === 'true'

  if (!full_name) return { error: 'الاسم الكامل مطلوب' }
  if (isNaN(ampere_count) || ampere_count <= 0) return { error: 'عدد الأمبير يجب أن يكون أكبر من صفر' }
  if (!join_date) return { error: 'تاريخ الانضمام مطلوب' }

  const { error } = await supabase
    .from('subscribers')
    .update({ full_name, phone_number, address, ampere_count, join_date, notes, active })
    .eq('id', id)
    .eq('generator_id', generatorId)

  if (error) return { error: 'فشل تحديث المشترك' }

  revalidatePath('/subscribers')
  revalidatePath('/')
  redirect('/subscribers')
}

export async function deleteSubscriberAction(id: string) {
  const supabase = await createClient()
  const generatorId = await getGeneratorId(supabase)
  if (!generatorId) return

  await supabase
    .from('subscribers')
    .delete()
    .eq('id', id)
    .eq('generator_id', generatorId)

  revalidatePath('/subscribers')
  revalidatePath('/payments')
  revalidatePath('/')
}
