export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="h-4 w-72 bg-slate-100 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
            <div className="h-8 w-10 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-slate-50 rounded" />
        ))}
      </div>
    </div>
  );
}
