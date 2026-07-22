import React, { useState, useEffect, useCallback } from "react";
import { executeConceptQuery, type PagedQueryResult } from "../../data/fhirApi";
import { ResultsTable } from "../../components/ResultsTable/ResultsTable";
import type { ResultRecordDetail } from "../../types/domain";

const EMPTY_FORM = { concept: null, matchMode: "ANY IN" as const, rows: [] };

export const RecordsPage: React.FC = () => {
  const [result, setResult] = useState<PagedQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof ResultRecordDetail>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetch = useCallback(async () => {
    setLoading(true);
    const r = await executeConceptQuery(EMPTY_FORM, { page, pageSize, search, status: statusFilter, sortKey, sortDir });
    setResult(r);
    setLoading(false);
  }, [page, pageSize, search, statusFilter, sortKey, sortDir]);

  useEffect(() => { fetch(); }, [fetch]);

  if (!result) return <div className="p-8 text-slate-400 animate-pulse">Loading records…</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md">
        <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Conceptual UI</p>
        <h1 className="text-lg font-bold mt-0.5">All Records</h1>
      </header>
      <main className="flex-1 p-6">
        <ResultsTable
          result={result}
          conceptName="all-records"
          search={search}
          statusFilter={statusFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          page={page}
          pageSize={pageSize}
          loading={loading}
          onSearch={setSearch}
          onStatusFilter={setStatusFilter}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onParamsChange={() => {}}
        />
      </main>
    </div>
  );
};
