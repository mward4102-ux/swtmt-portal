export default function CompaniesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-slate-200 rounded" />
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 h-8" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3 flex gap-4 border-t border-slate-100">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-50 rounded" />
            <div className="h-4 w-8 bg-slate-50 rounded" />
            <div className="h-4 w-16 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
