export default function StatCard({ label, value, icon, color = "purple", sub }) {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    green:  "bg-green-50 text-green-600",
    red:    "bg-red-50 text-red-600",
    blue:   "bg-blue-50 text-blue-600",
    amber:  "bg-amber-50 text-amber-600",
  };
  return (
    <div className={`${colors[color]} bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
