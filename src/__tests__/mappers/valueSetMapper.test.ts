import { describe, it, expect } from "vitest";
import { mapValueSetToConcept, mapBundleToConcepts } from "../../mappers/valueSetMapper";
import type { FhirValueSet, FhirBundle } from "../../types/fhir";

const mockValueSet: FhirValueSet = {
  resourceType: "ValueSet",
  id: "vasopressor-rxcui",
  url: "http://integrate.health/fhir/ValueSet/vasopressor-rxcui",
  version: "2",
  name: "INTEGRATEVasopressorRXCUI",
  title: "INTEGRATE Vasopressor RXCUI Codes",
  status: "active",
  date: "2025-03-18",
  publisher: "J. Smith",
};

describe("mapValueSetToConcept", () => {
  it("maps all present fields correctly", () => {
    const result = mapValueSetToConcept(mockValueSet);
    expect(result.id).toBe("vasopressor-rxcui");
    expect(result.name).toBe("INTEGRATE Vasopressor RXCUI Codes");
    expect(result.version).toBe("2");
    expect(result.author).toBe("J. Smith");
    expect(result.approval).toContain("2025-03-18");
    expect(result.fhirUrl).toBe("http://integrate.health/fhir/ValueSet/vasopressor-rxcui");
  });

  it("falls back to name when title is absent", () => {
    const vs: FhirValueSet = { ...mockValueSet, title: undefined };
    expect(mapValueSetToConcept(vs).name).toBe("INTEGRATEVasopressorRXCUI");
  });

  it("falls back to url as id when id is absent", () => {
    const vs: FhirValueSet = { ...mockValueSet, id: undefined };
    expect(mapValueSetToConcept(vs).id).toBe(mockValueSet.url);
  });

  it("uses 'Unknown' author when publisher is absent", () => {
    const vs: FhirValueSet = { ...mockValueSet, publisher: undefined };
    expect(mapValueSetToConcept(vs).author).toBe("Unknown");
  });

  it("uses 'Pending approval' when date is absent", () => {
    const vs: FhirValueSet = { ...mockValueSet, date: undefined };
    expect(mapValueSetToConcept(vs).approval).toBe("Pending approval");
  });
});

describe("mapBundleToConcepts", () => {
  it("returns empty array for empty bundle", () => {
    const bundle: FhirBundle<FhirValueSet> = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [],
    };
    expect(mapBundleToConcepts(bundle)).toEqual([]);
  });

  it("returns empty array when entry is undefined", () => {
    const bundle: FhirBundle<FhirValueSet> = {
      resourceType: "Bundle",
      type: "searchset",
    };
    expect(mapBundleToConcepts(bundle)).toEqual([]);
  });

  it("maps all ValueSet entries in the bundle", () => {
    const bundle: FhirBundle<FhirValueSet> = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [
        { resource: mockValueSet },
        {
          resource: {
            resourceType: "ValueSet",
            id: "lactate-codes",
            title: "Lactate Codes",
            status: "active",
          },
        },
      ],
    };
    const result = mapBundleToConcepts(bundle);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("INTEGRATE Vasopressor RXCUI Codes");
    expect(result[1].name).toBe("Lactate Codes");
  });

  it("skips entries whose resource is not a ValueSet", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      entry: [
        { resource: mockValueSet },
        { resource: { resourceType: "Patient", id: "p1" } as unknown as FhirValueSet },
      ],
    };
    expect(mapBundleToConcepts(bundle)).toHaveLength(1);
  });
});
