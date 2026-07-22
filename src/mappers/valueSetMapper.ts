import type { FhirBundle, FhirValueSet } from "../types/fhir";
import type { ConceptMeta } from "../types/domain";

/**
 * Maps a single FHIR R4 ValueSet resource to the UI's ConceptMeta shape.
 * Falls back gracefully when optional fields are absent.
 */
export function mapValueSetToConcept(vs: FhirValueSet): ConceptMeta {
  return {
    id: vs.id ?? vs.url ?? crypto.randomUUID(),
    name: vs.title ?? vs.name ?? "Unnamed Concept",
    version: vs.version ?? "1",
    author: vs.publisher ?? "Unknown",
    approval: vs.date
      ? `Approved ${vs.date}`
      : "Pending approval",
    fhirUrl: vs.url,
  };
}

/**
 * Extracts all ValueSet entries from a FHIR Bundle and maps them to
 * ConceptMeta objects. Non-ValueSet entries are skipped.
 */
export function mapBundleToConcepts(
  bundle: FhirBundle<FhirValueSet>
): ConceptMeta[] {
  if (!bundle.entry?.length) return [];

  return bundle.entry
    .map((entry) => entry.resource)
    .filter((r): r is FhirValueSet => r?.resourceType === "ValueSet")
    .map(mapValueSetToConcept);
}
