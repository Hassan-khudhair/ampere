'use client'

import { useState, useTransition } from 'react'
import { togglePaymentAction } from '@/lib/actions/payments'

interface PaymentToggleProps {
  paymentId: string
  isPaid: boolean
}

export function PaymentToggle({ paymentId, isPaid }: PaymentToggleProps) {
  const [paid, setPaid] = useState(isPaid)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !paid
    setPaid(next)
    startTransition(() => {
      togglePaymentAction(paymentId, next)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        paid
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
      } ${isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
    >
      <span className={`w-2 h-2 rounded-full ${paid ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {paid ? 'مدفوع' : 'غير مدفوع'}
    </button>
  )
}
