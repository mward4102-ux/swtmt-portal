export default function BidDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-3 w-16 bg-slate-100 rounded mb-3" />
        <div className="h-7 w-64 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="h-5 w-24 bg-slate-200 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-50 rounded" />
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="h-5 w-20 bg-slate-200 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
