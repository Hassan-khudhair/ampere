'use client'

import { useRouter } from 'next/navigation'
import { ARABIC_MONTHS } from '@/lib/utils/format'

interface MonthSelectorProps {
  year: number
  month: number
}

export function MonthSelector({ year, month }: MonthSelectorProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const navigate = (newYear: number, newMonth: number) => {
    router.push(`/payments?year=${newYear}&month=${newMonth}`)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => navigate(year, parseInt(e.target.value))}
        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-all"
      >
        {ARABIC_MONTHS.map((name, i) => (
          <option key={i} value={i + 1}>{name}</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => navigate(parseInt(e.target.value), month)}
        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-all"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
