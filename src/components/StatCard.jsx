export default function StatCard({ label, value, change, icon: Icon, accent = "blue" }) {
  const accents = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        {Icon && <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accents[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {change && (
          <span className={`text-xs font-medium ${change > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}