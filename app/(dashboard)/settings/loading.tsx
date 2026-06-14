export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-44 bg-slate-200 rounded-lg" />
        <div className="h-4 w-64 bg-slate-100 rounded-lg" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-28 bg-slate-200 rounded-lg" />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 space-y-1.5">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="h-3 w-64 bg-slate-100 rounded" />
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-11 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
