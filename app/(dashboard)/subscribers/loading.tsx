export default function SubscribersLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-slate-200 rounded-lg" />
          <div className="h-4 w-40 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
        <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
        <div className="w-36 h-10 bg-slate-100 rounded-xl" />
        <div className="w-20 h-10 bg-slate-200 rounded-xl" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex gap-8">
          {['الاسم', 'الهاتف', 'الأمبير', 'تاريخ الانضمام', 'الحالة'].map((h) => (
            <div key={h} className="h-4 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-slate-100 flex gap-8 items-center">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-6 w-14 bg-amber-100 rounded-lg" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-6 w-12 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
