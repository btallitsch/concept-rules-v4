import React, { useState, useCallback } from "react";
import { useConceptRules } from "../../hooks/useConceptRules";
import { ConceptSelector } from "../../components/ConceptSelector/ConceptSelector";
import { RulesTable } from "../../components/RulesTable/RulesTable";
import { ResultsTable } from "../../components/ResultsTable/ResultsTable";
import { Button } from "../../components/ui/Button";
import { MATCH_MODES } from "../../constants/fhir";
import type { MatchMode } from "../../types/domain";

export const ConceptRulesPage: React.FC = () => {
  const {
    concepts, conceptsLoading, form,
    queryResult, queryLoading, queryError,
    search, statusFilter, sortKey, sortDir, page, pageSize,
    selectConcept, setMatchMode, addRow, removeRow, updateRow,
    runQuery, setSearch, setStatusFilter, setSort, setPage, setPageSize,
  } = useConceptRules();

  const [showSelector, setShowSelector] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleParamsChange = useCallback(() => {
    if (hasRun) runQuery();
  }, [hasRun, runQuery]);

  const handleRunQuery = async () => {
    await runQuery();
    setHasRun(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showSelector && (
        <ConceptSelector
          concepts={concepts}
          currentConcept={form.concept}
          onConfirm={(c) => { selectConcept(c); setShowSelector(false); }}
          onCancel={() => setShowSelector(false)}
        />
      )}

      <header className="bg-blue-800 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Conceptual UI</p>
          <h1 className="text-lg font-bold mt-0.5">Concept Rules</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button size="sm" onClick={handleRunQuery} disabled={queryLoading || !form.concept}
            className="!bg-white !text-blue-800 hover:!bg-blue-50">
            {queryLoading ? "Running…" : "Save & Run"}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-4 max-w-6xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap gap-6 items-start justify-between">
            <div className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2.5 items-center flex-1">
              <MetaLabel>Concept Name</MetaLabel>
              {conceptsLoading ? (
                <div className="h-5 bg-slate-100 rounded animate-pulse w-64" />
              ) : (
                <button className="text-left text-sm font-bold text-blue-800 hover:text-blue-900 flex items-center gap-2 group"
                  onClick={() => setShowSelector(true)} data-testid="concept-name-btn">
                  {form.concept?.name ?? "Select a concept…"}
                  <span className="text-slate-300 group-hover:text-slate-500 text-base">✎</span>
                </button>
              )}
              <MetaLabel>Version</MetaLabel>   <MetaValue>{form.concept?.version}</MetaValue>
              <MetaLabel>Author</MetaLabel>    <MetaValue>{form.concept?.author}</MetaValue>
              <MetaLabel>Approval</MetaLabel>  <MetaValue>{form.concept?.approval}</MetaValue>
              {form.concept?.fhirUrl && (
                <><MetaLabel>FHIR URL</MetaLabel>
                <a href={form.concept.fhirUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate">{form.concept.fhirUrl}</a></>
              )}
            </div>
            <div className="border-l border-slate-200 pl-6 min-w-[140px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Match Mode</p>
              <div className="space-y-2">
                {MATCH_MODES.map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input type="radio" name="matchMode" value={m} checked={form.matchMode === m}
                      onChange={() => setMatchMode(m as MatchMode)} className="accent-blue-800" />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <RulesTable rows={form.rows} onAdd={addRow} onRemove={removeRow} onUpdate={updateRow} />

        <div className="flex justify-end">
          <Button onClick={handleRunQuery} disabled={queryLoading || !form.concept} data-testid="run-query-btn">
            {queryLoading ? "Running…" : "▶ Run Query"}
          </Button>
        </div>

        {queryError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            Query failed: {queryError}
          </div>
        )}

        {queryResult && (
          <ResultsTable
            result={queryResult} conceptName={form.concept?.name ?? "results"}
            search={search} statusFilter={statusFilter} sortKey={sortKey} sortDir={sortDir}
            page={page} pageSize={pageSize} loading={queryLoading}
            onSearch={setSearch} onStatusFilter={setStatusFilter} onSort={setSort}
            onPageChange={setPage} onPageSizeChange={setPageSize}
            onParamsChange={handleParamsChange}
          />
        )}
      </main>
    </div>
  );
};

const MetaLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{children}</span>
);
const MetaValue: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="text-sm text-slate-700">{children ?? "—"}</span>
);
