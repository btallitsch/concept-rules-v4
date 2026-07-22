import type { RuleRow, ConceptRuleForm } from "../types/domain";
import { FHIR_SYSTEMS } from "../constants/fhir";

/**
 * Maps a UI ValueOperator to its FHIR search modifier equivalent.
 * Used when translating rules to FHIR query parameters.
 */
export function operatorToFhirModifier(
  operator: RuleRow["operator"]
): string {
  switch (operator) {
    case "ANY OF":
      return ""; // comma-separated OR in FHIR search
    case "NOT IN":
      return ":not";
    case "EQUALS":
      return ":exact";
    case "CONTAINS":
      return ":contains";
    case "STARTS WITH":
      return "";
    case "IS NULL":
      return ":missing=true";
    default:
      return "";
  }
}

/**
 * Maps a column name to its FHIR search parameter name for MedicationRequest.
 * Spec: https://hl7.org/fhir/R4/medicationrequest.html#search
 */
export function columnToFhirParam(column: string): string {
  const map: Record<string, string> = {
    Name: `medication.code:text`,
    Codes: `code`,
    "Admin Route": `route`,
    Frequency: `timing-code`,
    Status: `status`,
    Category: `category`,
    Dosage: `dosage-instruction-text`,
    Prescriber: `requester`,
  };
  return map[column] ?? column.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Converts a comma/quote-separated value string into a clean array of terms.
 * Handles both `'value1', 'value2'` and `value1, value2` forms.
 */
export function parseValueList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

/**
 * Builds a FHIR system|code string for RxNorm codes.
 * Used when the column is "Codes" (mapped to RxNorm CUI).
 */
export function buildRxNormToken(code: string): string {
  return `${FHIR_SYSTEMS.RXNORM}|${code.trim()}`;
}

/**
 * Serialises a single RuleRow into a human-readable FHIR-style query fragment.
 * This is purely for display/debug; real FHIR search would use URL params.
 */
export function ruleRowToQueryFragment(row: RuleRow): string {
  const param = columnToFhirParam(row.column);
  const modifier = operatorToFhirModifier(row.operator);
  const values = parseValueList(row.value);

  if (row.operator === "IS NULL") {
    return `${row.recordType}?${param}:missing=true`;
  }

  const valueStr =
    row.column === "Codes"
      ? values.map(buildRxNormToken).join(",")
      : values.join(",");

  return `${row.recordType}?${param}${modifier}=${valueStr}`;
}

/**
 * Converts a complete ConceptRuleForm into a pseudo-FHIR query description
 * (array of fragments joined by the row's logic operator).
 */
export function formToQuerySummary(form: ConceptRuleForm): string {
  if (!form.rows.length) return "";
  return form.rows
    .map((row, i) =>
      i === 0
        ? ruleRowToQueryFragment(row)
        : `${row.logic} ${ruleRowToQueryFragment(row)}`
    )
    .join("\n");
}
