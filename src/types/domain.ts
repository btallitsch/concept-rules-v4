import type { FhirResourceType } from "./fhir";

/** Available logic operators between rules. */
export type LogicOperator = "AND" | "OR";

/** Available row-level value operators. */
export type ValueOperator =
  | "ANY OF"
  | "NOT IN"
  | "EQUALS"
  | "CONTAINS"
  | "STARTS WITH"
  | "IS NULL";

/** Available match modes for the concept as a whole. */
export type MatchMode = "ANY IN" | "ALL IN" | "NONE IN";

/** A single rule row in the concept rules form. */
export interface RuleRow {
  id: string;
  logic: LogicOperator;
  recordType: FhirResourceType;
  column: string;
  operator: ValueOperator;
  value: string;
}

/** Metadata for a concept pulled from a FHIR ValueSet. */
export interface ConceptMeta {
  id: string;
  name: string;
  version: string;
  author: string;
  approval: string;
  fhirUrl?: string;
}

/** The complete form state for a Concept Rule definition. */
export interface ConceptRuleForm {
  concept: ConceptMeta | null;
  matchMode: MatchMode;
  rows: RuleRow[];
}

/** A single result record returned after running the concept query. */
export interface ResultRecord {
  id: string;
  name: string;
  codes: string;
  adminRoute: string;
  frequency: string;
  status: string;
}

/** Shape of the async query result. */
export interface QueryResult {
  records: ResultRecord[];
  totalCount: number;
  executedAt: string;
}

/** Pagination state shared across paginated views. */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** Full detail record for the record detail page. */
export interface ResultRecordDetail extends ResultRecord {
  rxcui?: string;
  brandNames?: string[];
  drugClass?: string;
  mechanism?: string;
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  loincCode?: string;
  snomedCode?: string;
  lastUpdated?: string;
  source?: string;
}

/** A dashboard metric tile. */
export interface DashboardMetric {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}
