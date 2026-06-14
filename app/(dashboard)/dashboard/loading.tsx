export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded-lg" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded-lg" />
        <div className="h-2.5 bg-slate-100 rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="h-7 w-8 bg-slate-200 rounded mx-auto" />
              <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
