import type { ResultRecord } from "../types/domain";

const CSV_HEADERS: Array<keyof ResultRecord> = [
  "id",
  "name",
  "codes",
  "adminRoute",
  "frequency",
  "status",
];

function escapeCell(value: string): string {
  const needs_quotes = value.includes(",") || value.includes('"') || value.includes("\n");
  if (!needs_quotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Converts an array of ResultRecords to a RFC 4180-compliant CSV string.
 */
export function recordsToCsv(records: ResultRecord[]): string {
  const header = CSV_HEADERS.map((h) =>
    h.replace(/([A-Z])/g, " $1").trim().toUpperCase()
  ).join(",");

  const rows = records.map((r) =>
    CSV_HEADERS.map((h) => escapeCell(String(r[h]))).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Triggers a CSV download in the browser.
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
