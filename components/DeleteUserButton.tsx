'use client'

import { useTransition } from 'react'
import { deleteUserAction } from '@/lib/actions/admin'

interface Props {
  userId: string
  userEmail: string
}

export default function DeleteUserButton({ userId, userEmail }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`هل أنت متأكد من حذف حساب "${userEmail}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) return
    startTransition(async () => {
      const result = await deleteUserAction(userId)
      if (result.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-red-600 hover:text-red-800 disabled:text-red-300 text-sm font-medium transition-colors"
    >
      {pending ? 'جاري الحذف...' : 'حذف'}
    </button>
  )
}
