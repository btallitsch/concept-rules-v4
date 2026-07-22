/**
 * FHIR R4 core type definitions.
 * Subset covering ValueSet, CodeSystem, and Concept usage in the rules engine.
 * Spec: https://hl7.org/fhir/R4/
 */

export type FhirResourceType =
  | "MedicationRequest"
  | "Observation"
  | "Condition"
  | "Procedure"
  | "Encounter"
  | "DiagnosticReport"
  | "MedicationAdministration"
  | "AllergyIntolerance";

/** FHIR R4 Coding — a reference to a code defined by a terminology system. */
export interface FhirCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

/** FHIR R4 CodeableConcept — a value that may be expressed via a code. */
export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

/** FHIR R4 Identifier — a business identifier for a resource. */
export interface FhirIdentifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: FhirCodeableConcept;
  system?: string;
  value?: string;
}

/** FHIR R4 Meta — metadata about the resource. */
export interface FhirMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  tag?: FhirCoding[];
}

/** FHIR R4 ValueSet include filter — used inside ValueSet.compose. */
export interface FhirValueSetFilter {
  property: string;
  op:
    | "="
    | "is-a"
    | "descendent-of"
    | "is-not-a"
    | "regex"
    | "in"
    | "not-in"
    | "generalizes"
    | "exists";
  value: string;
}

/** FHIR R4 ValueSet compose include/exclude component. */
export interface FhirValueSetInclude {
  system?: string;
  version?: string;
  concept?: Array<{ code: string; display?: string }>;
  filter?: FhirValueSetFilter[];
  valueSet?: string[];
}

/** FHIR R4 ValueSet.compose — what belongs in this value set. */
export interface FhirValueSetCompose {
  lockedDate?: string;
  inactive?: boolean;
  include: FhirValueSetInclude[];
  exclude?: FhirValueSetInclude[];
}

/** FHIR R4 ValueSet resource. */
export interface FhirValueSet {
  resourceType: "ValueSet";
  id?: string;
  meta?: FhirMeta;
  url?: string;
  identifier?: FhirIdentifier[];
  version?: string;
  name?: string;
  title?: string;
  status: "draft" | "active" | "retired" | "unknown";
  experimental?: boolean;
  date?: string;
  publisher?: string;
  description?: string;
  compose?: FhirValueSetCompose;
}

/** FHIR R4 Bundle entry. */
export interface FhirBundleEntry<T = unknown> {
  fullUrl?: string;
  resource?: T;
}

/** FHIR R4 Bundle — a container for a collection of resources. */
export interface FhirBundle<T = unknown> {
  resourceType: "Bundle";
  id?: string;
  meta?: FhirMeta;
  type:
    | "document"
    | "message"
    | "transaction"
    | "transaction-response"
    | "batch"
    | "batch-response"
    | "history"
    | "searchset"
    | "collection";
  total?: number;
  entry?: FhirBundleEntry<T>[];
}

/** FHIR R4 MedicationRequest.medicationCodeableConcept (simplified). */
export interface FhirMedicationRequest {
  resourceType: "MedicationRequest";
  id?: string;
  meta?: FhirMeta;
  status: "active" | "on-hold" | "cancelled" | "completed" | "stopped" | "draft" | "unknown";
  intent: "proposal" | "plan" | "order" | "original-order" | "reflex-order" | "filler-order" | "instance-order" | "option";
  medicationCodeableConcept?: FhirCodeableConcept;
  subject?: { reference?: string };
  dosageInstruction?: Array<{
    route?: FhirCodeableConcept;
    timing?: { code?: FhirCodeableConcept };
    text?: string;
  }>;
}
