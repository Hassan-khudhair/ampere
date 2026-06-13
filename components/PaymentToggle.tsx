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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        paid
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-700 hover:bg-red-200'
      } ${isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
    >
      <span className="text-base leading-none">{paid ? '✓' : '✗'}</span>
      {paid ? 'مدفوع' : 'غير مدفوع'}
    </button>
  )
}
