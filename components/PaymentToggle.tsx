'use client'

import { useState, useTransition } from 'react'
import { togglePaymentAction } from '@/lib/actions/payments'
import { ConfirmDialog } from './ConfirmDialog'

interface PaymentToggleProps {
  paymentId: string
  isPaid: boolean
}

export function PaymentToggle({ paymentId, isPaid }: PaymentToggleProps) {
  const [paid, setPaid] = useState(isPaid)
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleClick = () => {
    if (!paid) {
      // unpaid → paid: ask for confirmation
      setConfirmOpen(true)
    } else {
      // paid → unpaid: toggle immediately
      setPaid(false)
      startTransition(() => {
        togglePaymentAction(paymentId, false)
      })
    }
  }

  const handleConfirm = () => {
    setPaid(true)
    startTransition(() => {
      togglePaymentAction(paymentId, true)
    })
    setConfirmOpen(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
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

      <ConfirmDialog
        open={confirmOpen}
        title="تأكيد الدفع"
        message="هل تريد تسجيل هذا الشهر كمدفوع؟"
        confirmLabel="تأكيد الدفع"
        variant="success"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
