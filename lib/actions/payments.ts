'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateMonthlyBilling, subscriberIsEligibleForMonth } from '@/lib/utils/billing'
import type { UserRole, Generator, Subscriber } from '@/lib/types/database'

export async function togglePaymentAction(paymentId: string, isPaid: boolean) {
  const supabase = await createClient()

  await supabase
    .from('monthly_payments')
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    } as Record<string, unknown>)
    .eq('id', paymentId)

  revalidatePath('/payments')
  revalidatePath('/')
}

export async function ensurePaymentsForMonth(year: number, month: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('generator_id, role')
    .eq('user_id', user.id)
    .single()

  const userRole = roleData as UserRole | null
  if (!userRole?.generator_id) return

  const generatorId = userRole.generator_id

  const { data: genData } = await supabase
    .from('generators')
    .select('ampere_price')
    .eq('id', generatorId)
    .single()

  const generator = genData as Pick<Generator, 'ampere_price'> | null
  if (!generator) return

  const { data: subsData } = await supabase
    .from('subscribers')
    .select('*')
    .eq('generator_id', generatorId)
    .eq('active', true)

  const subscribers = (subsData as Subscriber[] | null) ?? []
  if (subscribers.length === 0) return

  const { data: existingData } = await supabase
    .from('monthly_payments')
    .select('subscriber_id')
    .eq('generator_id', generatorId)
    .eq('year', year)
    .eq('month', month)

  const paidIds = new Set(
    ((existingData as Array<{ subscriber_id: string }> | null) ?? []).map((p) => p.subscriber_id)
  )

  const totalDaysInMonth = new Date(year, month, 0).getDate()

  const toInsert = subscribers
    .filter((sub) => !paidIds.has(sub.id) && subscriberIsEligibleForMonth(sub.join_date, year, month))
    .map((sub) => {
      const billing = calculateMonthlyBilling(sub.join_date, year, month, sub.ampere_count, generator.ampere_price)
      return {
        subscriber_id: sub.id,
        generator_id: generatorId,
        year,
        month,
        amount: billing.amount,
        ampere_price_snapshot: generator.ampere_price,
        is_paid: false,
        is_prorated: billing.isProrated,
        days_in_period: billing.daysInPeriod,
        total_days_in_month: totalDaysInMonth,
      }
    })

  if (toInsert.length > 0) {
    await supabase
      .from('monthly_payments')
      .upsert(toInsert as Parameters<ReturnType<typeof supabase.from>['upsert']>[0], {
        onConflict: 'subscriber_id,year,month',
        ignoreDuplicates: true,
      })
  }
}
