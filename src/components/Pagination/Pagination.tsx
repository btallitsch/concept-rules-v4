import React from "react";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [5, 10, 20, 50];

export const Pagination: React.FC<PaginationProps> = ({
  page, pageCount, pageSize, total, onPageChange, onPageSizeChange,
}) => {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) pages.push(i);
    if (page < pageCount - 2) pages.push("...");
    pages.push(pageCount);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50 text-sm">
      <span className="text-slate-500 text-xs">
        {total === 0 ? "No records" : `${start}–${end} of ${total} records`}
      </span>

      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onPageChange(1)} disabled={page === 1} label="«" />
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} label="‹" />
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-slate-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-semibold transition-colors
                ${p === page ? "bg-blue-800 text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              {p}
            </button>
          )
        )}
        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === pageCount} label="›" />
        <PageBtn onClick={() => onPageChange(pageCount)} disabled={page === pageCount} label="»" />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-slate-200 rounded-md px-1.5 py-1 bg-white text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
};

const PageBtn: React.FC<{ onClick: () => void; disabled: boolean; label: string }> = ({
  onClick, disabled, label,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="min-w-[32px] h-8 px-2 rounded-md text-xs font-bold text-slate-500
               hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
  >
    {label}
  </button>
);
