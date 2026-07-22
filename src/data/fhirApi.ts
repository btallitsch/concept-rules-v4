import type { FhirBundle, FhirValueSet } from "../types/fhir";
import type { ConceptRuleForm, QueryResult, ResultRecordDetail } from "../types/domain";
import { mockValueSetBundle, mockMedicationResults } from "./mockFhirBundle";

const SIMULATED_LATENCY_MS = 600;
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch ValueSet bundle.
 * Swap: GET [base]/ValueSet?status=active&_count=50
 */
export async function fetchValueSetBundle(): Promise<FhirBundle<FhirValueSet>> {
  await delay(SIMULATED_LATENCY_MS);
  return mockValueSetBundle;
}

export interface QueryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  sortKey?: keyof ResultRecordDetail;
  sortDir?: "asc" | "desc";
}

export interface PagedQueryResult extends Omit<QueryResult, "records"> {
  records: ResultRecordDetail[];
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * Execute a concept query with server-side pagination, search, and sort.
 * Swap: POST [base]/$evaluate-concept-rules with FHIR Parameters resource.
 */
export async function executeConceptQuery(
  _form: ConceptRuleForm,
  params: QueryParams
): Promise<PagedQueryResult> {
  await delay(SIMULATED_LATENCY_MS);

  const { page, pageSize, search = "", status = "all", sortKey = "id", sortDir = "asc" } = params;

  // Simulate server-side filter + sort
  let records = [...mockMedicationResults];

  if (status !== "all") {
    records = records.filter((r) => r.status === status);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    records = records.filter((r) =>
      (["id", "name", "codes", "adminRoute", "frequency", "status"] as const).some(
        (k) => String(r[k]).toLowerCase().includes(q)
      )
    );
  }

  records.sort((a, b) => {
    const av = String(a[sortKey] ?? "").toLowerCase();
    const bv = String(b[sortKey] ?? "").toLowerCase();
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const paged = records.slice(start, start + pageSize);

  return {
    records: paged,
    totalCount: total,
    executedAt: new Date().toISOString(),
    page: safePage,
    pageSize,
    pageCount,
  };
}

/**
 * Fetch a single record by ID.
 * Swap: GET [base]/MedicationRequest/[id]
 */
export async function fetchRecordDetail(id: string): Promise<ResultRecordDetail | null> {
  await delay(400);
  return mockMedicationResults.find((r) => r.id === id) ?? null;
}

/**
 * Fetch dashboard summary metrics.
 * Swap: GET [base]/$concept-summary
 */
export async function fetchDashboardMetrics() {
  await delay(400);
  const total = mockMedicationResults.length;
  const active = mockMedicationResults.filter((r) => r.status === "active").length;
  const vasopressors = mockMedicationResults.filter((r) => r.drugClass === "Vasopressor").length;
  return {
    totalRecords: total,
    activeRecords: active,
    vasopressors,
    vasodilators: mockMedicationResults.filter((r) => r.drugClass === "Vasodilator").length,
    inotropes: mockMedicationResults.filter((r) => r.drugClass === "Inotrope").length,
    valueSets: 11,
    lastRun: new Date().toISOString(),
    completionRate: Math.round((active / total) * 100),
  };
}
