import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardMetrics } from "../../data/fhirApi";

type Metrics = Awaited<ReturnType<typeof fetchDashboardMetrics>>;

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md">
        <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Conceptual UI</p>
        <h1 className="text-lg font-bold mt-0.5">Dashboard</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {!metrics ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-24" />
            ))
          ) : (
            <>
              <MetricTile label="Total Records"    value={metrics.totalRecords}   icon="💊" color="blue" />
              <MetricTile label="Active Records"   value={metrics.activeRecords}  icon="✅" color="green" />
              <MetricTile label="Value Sets"       value={metrics.valueSets}      icon="📋" color="violet" />
              <MetricTile label="Completion Rate"  value={`${metrics.completionRate}%`} icon="📊" color="amber" />
            </>
          )}
        </div>

        {/* Drug class breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Drug Class Breakdown</h2>
          {!metrics ? (
            <div className="animate-pulse space-y-3">
              {[70, 50, 30].map((w, i) => <div key={i} className={`h-4 bg-slate-100 rounded`} style={{ width: `${w}%` }} />)}
            </div>
          ) : (
            <div className="space-y-3">
              <BarRow label="Vasopressors" count={metrics.vasopressors} total={metrics.totalRecords} color="bg-blue-500" />
              <BarRow label="Vasodilators" count={metrics.vasodilators} total={metrics.totalRecords} color="bg-violet-500" />
              <BarRow label="Inotropes"    count={metrics.inotropes}    total={metrics.totalRecords} color="bg-amber-500" />
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction
            icon="⚙" title="Run Concept Query"
            description="Build and execute FHIR concept rules"
            onClick={() => navigate("/concept-rules")}
            color="blue"
          />
          <QuickAction
            icon="📋" title="Browse Value Sets"
            description="Explore FHIR ValueSet definitions"
            onClick={() => navigate("/value-sets")}
            color="violet"
          />
          <QuickAction
            icon="💊" title="View All Records"
            description="Browse paginated medication records"
            onClick={() => navigate("/records")}
            color="green"
          />
        </div>
      </main>
    </div>
  );
};

const MetricTile: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({
  label, value, icon, color,
}) => {
  const colors: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    green:  "bg-green-50 text-green-700 border-green-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`rounded-xl p-5 border shadow-sm ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const BarRow: React.FC<{ label: string; count: number; total: number; color: string }> = ({
  label, count, total, color,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span className="font-medium">{label}</span>
        <span>{count} records ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const QuickAction: React.FC<{ icon: string; title: string; description: string; onClick: () => void; color: string }> = ({
  icon, title, description, onClick, color,
}) => {
  const colors: Record<string, string> = {
    blue:   "hover:border-blue-300 hover:bg-blue-50",
    violet: "hover:border-violet-300 hover:bg-violet-50",
    green:  "hover:border-green-300 hover:bg-green-50",
  };
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-left
                  transition-colors group ${colors[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-bold text-slate-800 mt-2 group-hover:text-blue-800 transition-colors">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </button>
  );
};
