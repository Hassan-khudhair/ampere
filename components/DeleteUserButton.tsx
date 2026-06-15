'use client'

import { useState, useTransition } from 'react'
import { deleteUserAction } from '@/lib/actions/admin'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  userId: string
  userEmail: string
}

export default function DeleteUserButton({ userId, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteUserAction(userId)
      if (result.error) {
        alert(result.error)
      }
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
      >
        حذف
      </button>

      <ConfirmDialog
        open={open}
        title="حذف الحساب"
        message={`هل أنت متأكد من حذف حساب "${userEmail}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel="حذف الحساب"
        variant="danger"
        isPending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
