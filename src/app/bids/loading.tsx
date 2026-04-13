export default function BidsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-slate-200 rounded" />
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-3 w-24 bg-slate-50 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
