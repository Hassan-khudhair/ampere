'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

interface DeleteButtonProps {
  id: string
  label?: string
  action: (id: string) => Promise<void>
  confirmMessage?: string
}

export function DeleteButton({
  id,
  label = 'حذف',
  action,
  confirmMessage = 'هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.',
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    startTransition(async () => {
      await action(id)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-600 hover:text-red-800 hover:underline text-sm"
      >
        {label}
      </button>

      <ConfirmDialog
        open={open}
        title="تأكيد الحذف"
        message={confirmMessage}
        confirmLabel="حذف"
        variant="danger"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
