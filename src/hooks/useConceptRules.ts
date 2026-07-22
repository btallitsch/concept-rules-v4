import { useState, useEffect, useCallback } from "react";
import type { ConceptMeta, ConceptRuleForm, MatchMode, RuleRow } from "../types/domain";
import type { LogicOperator, ValueOperator } from "../types/domain";
import type { FhirResourceType } from "../types/fhir";
import type { ResultRecordDetail } from "../types/domain";
import { fetchValueSetBundle, executeConceptQuery, type PagedQueryResult, type QueryParams } from "../data/fhirApi";
import { mapBundleToConcepts } from "../mappers/valueSetMapper";
import { COLUMNS_BY_RECORD_TYPE, DEFAULT_RULE_ROW_VALUES } from "../constants/fhir";

function generateId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeDefaultRow(): RuleRow {
  return {
    id: generateId(),
    logic: DEFAULT_RULE_ROW_VALUES.logic as LogicOperator,
    recordType: DEFAULT_RULE_ROW_VALUES.recordType as FhirResourceType,
    column: DEFAULT_RULE_ROW_VALUES.column,
    operator: DEFAULT_RULE_ROW_VALUES.operator as ValueOperator,
    value: DEFAULT_RULE_ROW_VALUES.value,
  };
}

const INITIAL_ROWS: RuleRow[] = [
  { id: generateId(), logic: "AND", recordType: "MedicationRequest", column: "Name",       operator: "ANY OF", value: "Vasopressor Names, INTEGRATE Vasopressor Names" },
  { id: generateId(), logic: "OR",  recordType: "MedicationRequest", column: "Codes",      operator: "ANY OF", value: "INTEGRATE Vasopressor Codes, INTEGRATE Vasodilator Names" },
  { id: generateId(), logic: "AND", recordType: "MedicationRequest", column: "Admin Route", operator: "NOT IN", value: "'Oral', 'Eye Drop', 'Dropper'" },
  { id: generateId(), logic: "AND", recordType: "MedicationRequest", column: "Frequency",   operator: "NOT IN", value: "'Bolus'" },
];

const DEFAULT_PAGE_SIZE = 5;

export interface UseConceptRulesReturn {
  concepts: ConceptMeta[];
  conceptsLoading: boolean;
  form: ConceptRuleForm;
  queryResult: PagedQueryResult | null;
  queryLoading: boolean;
  queryError: string | null;
  // Query params (server-side)
  search: string;
  statusFilter: string;
  sortKey: keyof ResultRecordDetail;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
  // Actions
  selectConcept: (concept: ConceptMeta) => void;
  setMatchMode: (mode: MatchMode) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, patch: Partial<Omit<RuleRow, "id">>) => void;
  runQuery: () => Promise<void>;
  resetResults: () => void;
  setSearch: (s: string) => void;
  setStatusFilter: (s: string) => void;
  setSort: (key: keyof ResultRecordDetail, dir: "asc" | "desc") => void;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
}

export function useConceptRules(): UseConceptRulesReturn {
  const [concepts, setConcepts] = useState<ConceptMeta[]>([]);
  const [conceptsLoading, setConceptsLoading] = useState(true);
  const [form, setForm] = useState<ConceptRuleForm>({ concept: null, matchMode: "ANY IN", rows: INITIAL_ROWS });
  const [queryResult, setQueryResult] = useState<PagedQueryResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Server-side query params
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof ResultRecordDetail>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    fetchValueSetBundle().then((bundle) => {
      if (cancelled) return;
      const mapped = mapBundleToConcepts(bundle);
      setConcepts(mapped);
      setForm((f) => ({ ...f, concept: mapped[0] ?? null }));
      setConceptsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const buildParams = useCallback((): QueryParams => ({
    page, pageSize, search, status: statusFilter, sortKey, sortDir,
  }), [page, pageSize, search, statusFilter, sortKey, sortDir]);

  const runQuery = useCallback(async (overrides?: Partial<QueryParams>) => {
    setQueryLoading(true);
    setQueryError(null);
    try {
      const params = { ...buildParams(), ...overrides };
      const result = await executeConceptQuery(form, params);
      setQueryResult(result);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setQueryLoading(false);
    }
  }, [form, buildParams]);

  const selectConcept = useCallback((concept: ConceptMeta) => {
    setForm((f) => ({ ...f, concept }));
    setQueryResult(null);
  }, []);

  const setMatchMode = useCallback((matchMode: MatchMode) => {
    setForm((f) => ({ ...f, matchMode }));
  }, []);

  const addRow = useCallback(() => {
    setForm((f) => ({ ...f, rows: [...f.rows, makeDefaultRow()] }));
  }, []);

  const removeRow = useCallback((id: string) => {
    setForm((f) => ({ ...f, rows: f.rows.filter((r) => r.id !== id) }));
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<Omit<RuleRow, "id">>) => {
    setForm((f) => ({
      ...f,
      rows: f.rows.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        if (patch.recordType && patch.recordType !== r.recordType) {
          updated.column = COLUMNS_BY_RECORD_TYPE[patch.recordType][0];
        }
        return updated;
      }),
    }));
  }, []);

  const resetResults = useCallback(() => {
    setQueryResult(null);
    setQueryError(null);
  }, []);

  const handleSetSearch = useCallback((s: string) => {
    setSearch(s);
    setPage(1);
  }, []);

  const handleSetStatusFilter = useCallback((s: string) => {
    setStatusFilter(s);
    setPage(1);
  }, []);

  const handleSetSort = useCallback((key: keyof ResultRecordDetail, dir: "asc" | "desc") => {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }, []);

  const handleSetPageSize = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return {
    concepts, conceptsLoading, form, queryResult, queryLoading, queryError,
    search, statusFilter, sortKey, sortDir, page, pageSize,
    selectConcept, setMatchMode, addRow, removeRow, updateRow, runQuery, resetResults,
    setSearch: handleSetSearch,
    setStatusFilter: handleSetStatusFilter,
    setSort: handleSetSort,
    setPage,
    setPageSize: handleSetPageSize,
  };
}
