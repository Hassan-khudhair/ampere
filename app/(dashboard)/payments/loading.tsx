export default function PaymentsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-slate-100 rounded-xl" />
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-2">
            <div className="h-8 w-10 bg-slate-200 rounded-lg mx-auto" />
            <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
            <div className="h-4 w-20 bg-slate-100 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="h-2.5 bg-slate-100 rounded-full" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex gap-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-slate-100 flex gap-8 items-center">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-14 bg-amber-100 rounded-lg" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
