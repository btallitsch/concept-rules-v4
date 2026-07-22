import React, { useEffect, useState } from "react";
import { fetchValueSetBundle } from "../../data/fhirApi";
import { mapBundleToConcepts } from "../../mappers/valueSetMapper";
import type { ConceptMeta } from "../../types/domain";

export const ValueSetsPage: React.FC = () => {
  const [concepts, setConcepts] = useState<ConceptMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchValueSetBundle().then((b) => {
      setConcepts(mapBundleToConcepts(b));
      setLoading(false);
    });
  }, []);

  const filtered = concepts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md">
        <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Conceptual UI</p>
        <h1 className="text-lg font-bold mt-0.5">Value Sets</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">FHIR ValueSets</span>
              <span className="bg-violet-100 text-violet-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search value sets…"
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                <th className="px-4 py-2.5 text-left font-semibold">Version</th>
                <th className="px-4 py-2.5 text-left font-semibold">Author / Publisher</th>
                <th className="px-4 py-2.5 text-left font-semibold">Approval</th>
                <th className="px-4 py-2.5 text-left font-semibold">FHIR URL</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((c, i) => (
                    <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors
                      ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-100">
                          v{c.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.author}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{c.approval}</td>
                      <td className="px-4 py-3">
                        {c.fhirUrl ? (
                          <a href={c.fhirUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline font-mono truncate block max-w-[260px]">
                            {c.fhirUrl}
                          </a>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
