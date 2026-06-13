'use client'

import { useTransition } from 'react'

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
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm(confirmMessage)) return
    startTransition(() => {
      action(id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 hover:underline text-sm disabled:opacity-50 disabled:cursor-wait"
    >
      {isPending ? 'جاري الحذف...' : label}
    </button>
  )
}
