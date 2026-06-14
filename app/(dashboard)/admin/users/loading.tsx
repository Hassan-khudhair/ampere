export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-44 bg-slate-200 rounded-lg" />
        <div className="h-4 w-36 bg-slate-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-2">
            <div className="h-9 w-10 bg-slate-200 rounded-lg mx-auto" />
            <div className="h-4 w-24 bg-slate-100 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-slate-100 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
