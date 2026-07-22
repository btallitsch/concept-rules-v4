import type { FhirResourceType } from "../types/fhir";
import type { ValueOperator, MatchMode } from "../types/domain";

// ─── FHIR Code System URIs ───────────────────────────────────────────────────
// https://hl7.org/fhir/R4/terminologies-systems.html

export const FHIR_SYSTEMS = {
  RXNORM: "http://www.nlm.nih.gov/research/umls/rxnorm",
  SNOMED: "http://snomed.info/sct",
  LOINC: "http://loinc.org",
  ICD10CM: "http://hl7.org/fhir/sid/icd-10-cm",
  NDC: "http://hl7.org/fhir/sid/ndc",
  UCUM: "http://unitsofmeasure.org",
  HL7_MEDICATION_ADMIN_ROUTE:
    "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
  HL7_REQUEST_INTENT:
    "http://hl7.org/fhir/CodeSystem/medicationrequest-intent",
  HL7_MEDICATION_STATUS:
    "http://hl7.org/fhir/CodeSystem/medicationrequest-status",
} as const;

export const FHIR_VALUE_SET_BASE_URL =
  "http://hl7.org/fhir/ValueSet/";

// ─── Supported FHIR Resource Types ──────────────────────────────────────────

export const SUPPORTED_RECORD_TYPES: FhirResourceType[] = [
  "MedicationRequest",
  "Observation",
  "Condition",
  "Procedure",
  "Encounter",
  "DiagnosticReport",
  "MedicationAdministration",
  "AllergyIntolerance",
];

// ─── Column options per record type ─────────────────────────────────────────
// Maps each FHIR resource type to the queryable columns exposed in the UI.

export const COLUMNS_BY_RECORD_TYPE: Record<FhirResourceType, string[]> = {
  MedicationRequest: [
    "Name",
    "Codes",
    "Admin Route",
    "Frequency",
    "Status",
    "Category",
    "Dosage",
    "Prescriber",
  ],
  Observation: ["Code", "Value", "Unit", "Status", "Category", "Effective Date"],
  Condition: ["Code", "Clinical Status", "Verification Status", "Category", "Severity"],
  Procedure: ["Code", "Status", "Category", "Performer", "Performed Date"],
  Encounter: ["Class", "Type", "Status", "Service Type", "Admission Date"],
  DiagnosticReport: ["Code", "Status", "Category", "Effective Date", "Performer"],
  MedicationAdministration: ["Medication", "Status", "Route", "Dose", "Effective Time"],
  AllergyIntolerance: ["Code", "Clinical Status", "Verification Status", "Type", "Category"],
};

// ─── Operators ───────────────────────────────────────────────────────────────

export const VALUE_OPERATORS: ValueOperator[] = [
  "ANY OF",
  "NOT IN",
  "EQUALS",
  "CONTAINS",
  "STARTS WITH",
  "IS NULL",
];

export const MATCH_MODES: MatchMode[] = ["ANY IN", "ALL IN", "NONE IN"];

// ─── RxNorm route codes (subset) used for admin route filtering ──────────────
// Source: https://www.hl7.org/fhir/valueset-route-codes.html

export const EXCLUDED_ADMIN_ROUTES = [
  "Oral",
  "Eye Drop",
  "Dropper",
  "Topical",
  "Nasal",
  "Otic",
  "Rectal",
  "Vaginal",
  "Sublingual",
  "Buccal",
] as const;

// ─── Default row template ────────────────────────────────────────────────────

export const DEFAULT_RULE_ROW_VALUES = {
  logic: "AND",
  recordType: "MedicationRequest",
  column: "Name",
  operator: "ANY OF",
  value: "",
} as const;
