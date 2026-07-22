import { describe, it, expect } from "vitest";
import { recordsToCsv } from "../../utils/csvExport";
import type { ResultRecord } from "../../types/domain";

const sampleRecords: ResultRecord[] = [
  { id: "RX-001", name: "Norepinephrine", codes: "3992", adminRoute: "IV", frequency: "Continuous", status: "active" },
  { id: "RX-002", name: "Epinephrine",    codes: "3498", adminRoute: "IV", frequency: "PRN",        status: "active" },
];

describe("recordsToCsv", () => {
  it("includes a header row", () => {
    const csv = recordsToCsv(sampleRecords);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toContain("ID");
    expect(firstLine).toContain("NAME");
    expect(firstLine).toContain("STATUS");
  });

  it("outputs the correct number of data rows", () => {
    const lines = recordsToCsv(sampleRecords).split("\n");
    // 1 header + 2 data rows
    expect(lines).toHaveLength(3);
  });

  it("serialises all record fields", () => {
    const csv = recordsToCsv(sampleRecords);
    expect(csv).toContain("RX-001");
    expect(csv).toContain("Norepinephrine");
    expect(csv).toContain("3992");
    expect(csv).toContain("Continuous");
  });

  it("wraps cells containing commas in double quotes", () => {
    const records: ResultRecord[] = [
      { id: "RX-001", name: "Drug, Name", codes: "1234", adminRoute: "IV", frequency: "PRN", status: "active" },
    ];
    const csv = recordsToCsv(records);
    expect(csv).toContain('"Drug, Name"');
  });

  it("escapes double quotes within cell values", () => {
    const records: ResultRecord[] = [
      { id: "RX-001", name: 'Drug "X"', codes: "1234", adminRoute: "IV", frequency: "PRN", status: "active" },
    ];
    const csv = recordsToCsv(records);
    expect(csv).toContain('"Drug ""X"""');
  });

  it("returns only header row for empty records array", () => {
    const lines = recordsToCsv([]).split("\n");
    expect(lines).toHaveLength(1);
  });
});
