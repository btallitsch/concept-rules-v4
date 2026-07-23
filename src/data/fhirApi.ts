import type { FhirBundle, FhirValueSet } from "../types/fhir";
import type { ConceptRuleForm, QueryResult, ResultRecordDetail } from "../types/domain";
import { mockValueSetBundle } from "./mockFhirBundle";

// ─── JSON data source ─────────────────────────────────────────────────────────
// Place your JSON file at:  /public/data/medications.json
// It will be served at:     /data/medications.json  (Vite static asset)
//
// Supported shapes:
//   [{ "id": "...", "name": "..." }]     ← bare array
//   { "data": [...] }                    ← data envelope
//   { "entry": [...] }                   ← FHIR-style envelope
//   { "results": [...] }                 ← results envelope

const JSON_URL = "/data/medications.json";

// Module-level cache — file is fetched once per browser session
let recordCache: ResultRecordDetail[] | null = null;

/**
 * Maps a raw JSON object to ResultRecordDetail.
 * Adjust field names here if your JSON uses different keys.
 */
function mapJsonRecord(raw: Record<string, unknown>): ResultRecordDetail {
  return {
    id:         String(raw["id"]         ?? raw["ID"]          ?? crypto.randomUUID()),
    name:       String(raw["name"]       ?? raw["Name"]        ?? raw["medicationName"] ?? ""),
    codes:      String(raw["codes"]      ?? raw["code"]        ?? raw["rxcui"]          ?? ""),
    adminRoute: String(raw["adminRoute"] ?? raw["admin_route"] ?? raw["route"]          ?? ""),
    frequency:  String(raw["frequency"]  ?? raw["Frequency"]   ?? raw["timing"]         ?? ""),
    status:     String(raw["status"]     ?? raw["Status"]      ?? "unknown"),
    // Optional enrichment fields — present only if your JSON includes them
    drugClass:         raw["drugClass"]         != null ? String(raw["drugClass"])                            : undefined,
    rxcui:             raw["rxcui"]             != null ? String(raw["rxcui"])                                : undefined,
    brandNames:        Array.isArray(raw["brandNames"])        ? (raw["brandNames"] as string[])             : undefined,
    mechanism:         raw["mechanism"]         != null ? String(raw["mechanism"])                            : undefined,
    indications:       Array.isArray(raw["indications"])       ? (raw["indications"] as string[])            : undefined,
    contraindications: Array.isArray(raw["contraindications"]) ? (raw["contraindications"] as string[])      : undefined,
    sideEffects:       Array.isArray(raw["sideEffects"])       ? (raw["sideEffects"] as string[])            : undefined,
    loincCode:         raw["loincCode"]         != null ? String(raw["loincCode"])                            : undefined,
    snomedCode:        raw["snomedCode"]        != null ? String(raw["snomedCode"])                           : undefined,
    lastUpdated:       raw["lastUpdated"]        != null ? String(raw["lastUpdated"])                         : undefined,
    source:            raw["source"]             != null ? String(raw["source"])                              : undefined,
  };
}

async function loadRecords(): Promise<ResultRecordDetail[]> {
  if (recordCache) return recordCache;

  const response = await fetch(JSON_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load ${JSON_URL}: ${response.status} ${response.statusText}`
    );
  }

  const json: unknown = await response.json();

  // Unwrap common envelope shapes
  const raw: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as Record<string, unknown>)?.["data"])    ? (json as Record<string, unknown[]>)["data"]
    : Array.isArray((json as Record<string, unknown>)?.["entry"])   ? (json as Record<string, unknown[]>)["entry"]
    : Array.isArray((json as Record<string, unknown>)?.["results"]) ? (json as Record<string, unknown[]>)["results"]
    : [];

  if (raw.length === 0) {
    console.warn(`[fhirApi] No records found in ${JSON_URL}. Check the JSON shape.`);
  }

  recordCache = raw.map((item) => mapJsonRecord(item as Record<string, unknown>));
  return recordCache;
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
 * Fetch ValueSet bundle.
 * Swap: GET [base]/ValueSet?status=active&_count=50
 */
export async function fetchValueSetBundle(): Promise<FhirBundle<FhirValueSet>> {
  return mockValueSetBundle;
}

/**
 * Execute a concept query with client-side pagination, search, and sort
 * over the JSON file loaded from /public/data/medications.json.
 *
 * To swap to a real FHIR server:
 *   Replace loadRecords() with a fetch to your FHIR endpoint and return
 *   the server's paged response directly.
 */
export async function executeConceptQuery(
  _form: ConceptRuleForm,
  params: QueryParams
): Promise<PagedQueryResult> {
  const {
    page, pageSize,
    search = "", status = "all",
    sortKey = "id", sortDir = "asc",
  } = params;

  const allRecords = await loadRecords();

  let records = [...allRecords];

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

  return {
    records: records.slice(start, start + pageSize),
    totalCount: total,
    executedAt: new Date().toISOString(),
    page: safePage,
    pageSize,
    pageCount,
  };
}

/**
 * Fetch a single record by ID from the loaded JSON.
 * Swap: GET [base]/MedicationRequest/[id]
 */
export async function fetchRecordDetail(
  id: string
): Promise<ResultRecordDetail | null> {
  const records = await loadRecords();
  return records.find((r) => r.id === id) ?? null;
}

/**
 * Derive dashboard metrics from the loaded JSON.
 * Swap: GET [base]/$concept-summary
 */
export async function fetchDashboardMetrics() {
  const records = await loadRecords();
  const total     = records.length;
  const active    = records.filter((r) => r.status === "active").length;
  return {
    totalRecords:    total,
    activeRecords:   active,
    vasopressors:    records.filter((r) => r.drugClass === "Vasopressor").length,
    vasodilators:    records.filter((r) => r.drugClass === "Vasodilator").length,
    inotropes:       records.filter((r) => r.drugClass === "Inotrope").length,
    valueSets:       11,
    lastRun:         new Date().toISOString(),
    completionRate:  total > 0 ? Math.round((active / total) * 100) : 0,
  };
}

/** Clear the record cache — useful for hot-reloading during development. */
export function clearRecordCache(): void {
  recordCache = null;
}
