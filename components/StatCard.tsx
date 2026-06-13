interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'amber' | 'slate'
  icon?: string
}

const colorMap = {
  blue:  { card: 'bg-blue-50 border-blue-100',  icon: 'bg-blue-100 text-blue-600',  value: 'text-blue-700' },
  green: { card: 'bg-green-50 border-green-100', icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  red:   { card: 'bg-red-50 border-red-100',    icon: 'bg-red-100 text-red-600',    value: 'text-red-700' },
  amber: { card: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
  slate: { card: 'bg-white border-slate-100',    icon: 'bg-slate-100 text-slate-600', value: 'text-slate-700' },
}

export function StatCard({ title, value, subtitle, color = 'slate', icon }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <div className={`rounded-xl border p-5 ${colors.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
