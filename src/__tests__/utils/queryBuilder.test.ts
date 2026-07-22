import { describe, it, expect } from "vitest";
import {
  operatorToFhirModifier,
  columnToFhirParam,
  parseValueList,
  buildRxNormToken,
  ruleRowToQueryFragment,
  formToQuerySummary,
} from "../../utils/queryBuilder";
import type { RuleRow, ConceptRuleForm } from "../../types/domain";
import { FHIR_SYSTEMS } from "../../constants/fhir";

describe("operatorToFhirModifier", () => {
  it('returns empty string for "ANY OF"', () => {
    expect(operatorToFhirModifier("ANY OF")).toBe("");
  });

  it('returns ":not" for "NOT IN"', () => {
    expect(operatorToFhirModifier("NOT IN")).toBe(":not");
  });

  it('returns ":exact" for "EQUALS"', () => {
    expect(operatorToFhirModifier("EQUALS")).toBe(":exact");
  });

  it('returns ":contains" for "CONTAINS"', () => {
    expect(operatorToFhirModifier("CONTAINS")).toBe(":contains");
  });

  it('returns ":missing=true" for "IS NULL"', () => {
    expect(operatorToFhirModifier("IS NULL")).toBe(":missing=true");
  });
});

describe("columnToFhirParam", () => {
  it("maps Name to medication.code:text", () => {
    expect(columnToFhirParam("Name")).toBe("medication.code:text");
  });

  it("maps Codes to code", () => {
    expect(columnToFhirParam("Codes")).toBe("code");
  });

  it("maps Admin Route to route", () => {
    expect(columnToFhirParam("Admin Route")).toBe("route");
  });

  it("converts unknown column to kebab-case", () => {
    expect(columnToFhirParam("My Custom Field")).toBe("my-custom-field");
  });
});

describe("parseValueList", () => {
  it("splits comma-separated plain values", () => {
    expect(parseValueList("Norepinephrine, Vasopressin")).toEqual([
      "Norepinephrine",
      "Vasopressin",
    ]);
  });

  it("strips surrounding single quotes", () => {
    expect(parseValueList("'Oral', 'Eye Drop'")).toEqual(["Oral", "Eye Drop"]);
  });

  it("strips surrounding double quotes", () => {
    expect(parseValueList('"Bolus"')).toEqual(["Bolus"]);
  });

  it("filters empty entries after splitting", () => {
    expect(parseValueList("A, , B")).toEqual(["A", "B"]);
  });

  it("returns empty array for empty string", () => {
    expect(parseValueList("")).toEqual([]);
  });
});

describe("buildRxNormToken", () => {
  it("prepends the RxNorm system URI", () => {
    expect(buildRxNormToken("3992")).toBe(`${FHIR_SYSTEMS.RXNORM}|3992`);
  });

  it("trims whitespace from the code", () => {
    expect(buildRxNormToken("  3992  ")).toBe(`${FHIR_SYSTEMS.RXNORM}|3992`);
  });
});

describe("ruleRowToQueryFragment", () => {
  const baseRow: RuleRow = {
    id: "r1",
    logic: "AND",
    recordType: "MedicationRequest",
    column: "Name",
    operator: "ANY OF",
    value: "Norepinephrine, Vasopressin",
  };

  it("builds a correct ANY OF fragment for Name column", () => {
    expect(ruleRowToQueryFragment(baseRow)).toBe(
      "MedicationRequest?medication.code:text=Norepinephrine,Vasopressin"
    );
  });

  it("builds a correct NOT IN fragment", () => {
    const row: RuleRow = {
      ...baseRow,
      column: "Admin Route",
      operator: "NOT IN",
      value: "'Oral', 'Eye Drop'",
    };
    expect(ruleRowToQueryFragment(row)).toBe(
      "MedicationRequest?route:not=Oral,Eye Drop"
    );
  });

  it("builds correct fragment with RxNorm tokens for Codes column", () => {
    const row: RuleRow = {
      ...baseRow,
      column: "Codes",
      operator: "ANY OF",
      value: "3992, 3498",
    };
    expect(ruleRowToQueryFragment(row)).toContain(FHIR_SYSTEMS.RXNORM);
  });

  it("returns missing=true fragment for IS NULL operator", () => {
    const row: RuleRow = { ...baseRow, operator: "IS NULL", value: "" };
    expect(ruleRowToQueryFragment(row)).toContain(":missing=true");
  });
});

describe("formToQuerySummary", () => {
  const makeRow = (logic: "AND" | "OR", value: string): RuleRow => ({
    id: crypto.randomUUID(),
    logic,
    recordType: "MedicationRequest",
    column: "Name",
    operator: "ANY OF",
    value,
  });

  it("returns empty string for empty rows", () => {
    const form: ConceptRuleForm = {
      concept: null,
      matchMode: "ANY IN",
      rows: [],
    };
    expect(formToQuerySummary(form)).toBe("");
  });

  it("prefixes subsequent rows with their logic operator", () => {
    const form: ConceptRuleForm = {
      concept: null,
      matchMode: "ANY IN",
      rows: [makeRow("AND", "Norepinephrine"), makeRow("OR", "Dopamine")],
    };
    const summary = formToQuerySummary(form);
    const lines = summary.split("\n");
    expect(lines[0]).not.toMatch(/^AND|^OR/);
    expect(lines[1]).toMatch(/^OR /);
  });
});
