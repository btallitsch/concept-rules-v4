import React from "react";
import { useNavigate } from "react-router-dom";
import type { ResultRecordDetail } from "../../types/domain";
import type { PagedQueryResult } from "../../data/fhirApi";
import { Button } from "../ui/Button";
import { Pagination } from "../Pagination/Pagination";
import { recordsToCsv, downloadCsv } from "../../utils/csvExport";

interface Column {
  label: string;
  key: keyof ResultRecordDetail;
  sortable?: boolean;
}

const COLUMNS: Column[] = [
  { label: "ID",          key: "id",          sortable: true },
  { label: "Name",        key: "name",        sortable: true },
  { label: "Drug Class",  key: "drugClass",   sortable: true },
  { label: "Codes",       key: "codes",       sortable: true },
  { label: "Admin Route", key: "adminRoute",  sortable: true },
  { label: "Frequency",   key: "frequency",   sortable: true },
  { label: "Status",      key: "status",      sortable: true },
];

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface ResultsTableProps {
  result: PagedQueryResult;
  conceptName: string;
  search: string;
  statusFilter: string;
  sortKey: keyof ResultRecordDetail;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
  loading: boolean;
  onSearch: (s: string) => void;
  onStatusFilter: (s: string) => void;
  onSort: (key: keyof ResultRecordDetail, dir: "asc" | "desc") => void;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onParamsChange: () => void; // trigger re-fetch
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  result, conceptName, search, statusFilter, sortKey, sortDir,
  page, pageSize, loading,
  onSearch, onStatusFilter, onSort, onPageChange, onPageSizeChange, onParamsChange,
}) => {
  const navigate = useNavigate();

  const statuses = ["all", ...Array.from(new Set(
    result.records.map((r) => r.status).concat(["active", "completed", "on-hold", "cancelled"])
  ))];

  const handleSort = (key: keyof ResultRecordDetail) => {
    const newDir = key === sortKey && sortDir === "asc" ? "desc" : "asc";
    onSort(key, newDir);
    onParamsChange();
  };

  const handleSearchChange = (s: string) => {
    onSearch(s);
    onParamsChange();
  };

  const handleStatusChange = (s: string) => {
    onStatusFilter(s);
    onParamsChange();
  };

  const handlePageChange = (p: number) => {
    onPageChange(p);
    onParamsChange();
  };

  const handlePageSizeChange = (s: number) => {
    onPageSizeChange(s);
    onParamsChange();
  };

  const handleExport = () => {
    const csv = recordsToCsv(result.records);
    downloadCsv(csv, `${conceptName.replace(/\s+/g, "_")}_results.csv`);
  };

  const SortIcon = ({ col }: { col: keyof ResultRecordDetail }) => {
    if (col !== sortKey) return <span className="text-slate-300 ml-1 text-xs">↕</span>;
    return <span className="text-blue-300 ml-1 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-testid="results-table">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">Results</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {result.totalCount} total
          </span>
          {loading && (
            <span className="text-xs text-slate-400 animate-pulse">Fetching…</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Executed {new Date(result.executedAt).toLocaleTimeString()}
          </span>
          <Button variant="success" size="sm" onClick={handleExport} data-testid="export-csv-btn">
            ⬇ Export CSV
          </Button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search across all columns…"
            data-testid="results-search-input"
            className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >✕</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            data-testid="status-filter"
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50
                       focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
            ))}
          </select>
        </div>
        {(search || statusFilter !== "all") && (
          <button
            onClick={() => { handleSearchChange(""); handleStatusChange("all"); }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
              {COLUMNS.map(({ label, key, sortable }) => (
                <th
                  key={key}
                  onClick={sortable ? () => handleSort(key) : undefined}
                  className={`px-4 py-2.5 text-left font-semibold
                    ${sortable ? "cursor-pointer hover:bg-slate-200 select-none transition-colors" : ""}`}
                >
                  {label}{sortable && <SortIcon col={key} />}
                </th>
              ))}
              <th className="px-4 py-2.5 text-left font-semibold w-16">Detail</th>
            </tr>
          </thead>
          <tbody>
            {result.records.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-slate-400 text-sm"
                    data-testid="no-results-msg">
                  No records match{search ? ` "${search}"` : ""}.
                </td>
              </tr>
            ) : result.records.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/records/${r.id}`)}
                className={`border-b border-slate-100 cursor-pointer transition-colors group
                  ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  hover:bg-blue-50`}
              >
                <td className="px-4 py-2.5">
                  <code className="text-xs bg-slate-100 group-hover:bg-blue-100 px-1.5 py-0.5 rounded font-mono transition-colors">
                    {highlight(r.id, search)}
                  </code>
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-800 group-hover:text-blue-800 transition-colors">
                  {highlight(r.name, search)}
                </td>
                <td className="px-4 py-2.5">
                  {r.drugClass && (
                    <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium border border-violet-100">
                      {r.drugClass}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{highlight(r.codes, search)}</td>
                <td className="px-4 py-2.5 text-slate-600">{highlight(r.adminRoute, search)}</td>
                <td className="px-4 py-2.5 text-slate-600">{highlight(r.frequency, search)}</td>
                <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/records/${r.id}`); }}
                    className="text-blue-400 hover:text-blue-700 text-base transition-colors"
                    aria-label={`View detail for ${r.name}`}
                    title="View detail"
                  >
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        pageCount={result.pageCount}
        pageSize={pageSize}
        total={result.totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    active:    "bg-green-100 text-green-800",
    completed: "bg-slate-100 text-slate-600",
    "on-hold": "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full
      ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
};
