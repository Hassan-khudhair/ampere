interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'amber' | 'slate' | 'purple'
  icon?: React.ReactNode
}

const colorMap = {
  blue:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   value: 'text-blue-700',   border: 'border-blue-100' },
  green:  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', value: 'text-emerald-700', border: 'border-emerald-100' },
  red:    { bg: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-600',    value: 'text-red-700',    border: 'border-red-100' },
  amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  value: 'text-amber-700',  border: 'border-amber-100' },
  slate:  { bg: 'bg-slate-600',  light: 'bg-slate-50',  text: 'text-slate-600',  value: 'text-slate-700',  border: 'border-slate-100' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', value: 'text-purple-700', border: 'border-purple-100' },
}

export function StatCard({ title, value, subtitle, color = 'slate', icon }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
          <p className={`text-2xl font-bold ${c.value} leading-none`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl ${c.light} flex items-center justify-center shrink-0`}>
            <span className={c.text}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
