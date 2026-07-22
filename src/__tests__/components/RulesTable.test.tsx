import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RulesTable } from "../../components/RulesTable/RulesTable";
import type { RuleRow } from "../../types/domain";

const makeRow = (overrides: Partial<RuleRow> = {}): RuleRow => ({
  id: "row-1",
  logic: "AND",
  recordType: "MedicationRequest",
  column: "Name",
  operator: "ANY OF",
  value: "Norepinephrine",
  ...overrides,
});

const defaultProps = {
  rows: [makeRow()],
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  onUpdate: vi.fn(),
};

describe("RulesTable", () => {
  it("renders the table with column headers", () => {
    render(<RulesTable {...defaultProps} />);
    expect(screen.getByText("Record Type")).toBeInTheDocument();
    expect(screen.getByText("Operator")).toBeInTheDocument();
    expect(screen.getByText("Values")).toBeInTheDocument();
  });

  it("renders WHERE badge for the first row instead of logic dropdown", () => {
    render(<RulesTable {...defaultProps} />);
    expect(screen.getByText("WHERE")).toBeInTheDocument();
  });

  it("shows AND/OR dropdown for subsequent rows", () => {
    const rows = [makeRow({ id: "r1" }), makeRow({ id: "r2", logic: "OR" })];
    render(<RulesTable {...defaultProps} rows={rows} />);
    const logicSelects = screen.getAllByRole("combobox", { name: /logic/i });
    expect(logicSelects).toHaveLength(1); // only second row has the dropdown
  });

  it("calls onAdd when + Add Row is clicked", () => {
    const onAdd = vi.fn();
    render(<RulesTable {...defaultProps} onAdd={onAdd} />);
    fireEvent.click(screen.getByTestId("add-row-btn"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove with the row id when ✕ is clicked", () => {
    const onRemove = vi.fn();
    render(<RulesTable {...defaultProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: /remove row/i }));
    expect(onRemove).toHaveBeenCalledWith("row-1");
  });

  it("calls onUpdate when the values input changes", () => {
    const onUpdate = vi.fn();
    render(<RulesTable {...defaultProps} onUpdate={onUpdate} />);
    const input = screen.getByRole("textbox", { name: /values/i });
    fireEvent.change(input, { target: { value: "Vasopressin" } });
    expect(onUpdate).toHaveBeenCalledWith("row-1", { value: "Vasopressin" });
  });

  it("calls onUpdate with new recordType when Record Type dropdown changes", () => {
    const onUpdate = vi.fn();
    render(<RulesTable {...defaultProps} onUpdate={onUpdate} />);
    const select = screen.getByRole("combobox", { name: /record type/i });
    fireEvent.change(select, { target: { value: "Observation" } });
    expect(onUpdate).toHaveBeenCalledWith("row-1", { recordType: "Observation" });
  });

  it("shows empty state when rows is empty", () => {
    render(<RulesTable {...defaultProps} rows={[]} />);
    expect(screen.getByText(/no rules defined/i)).toBeInTheDocument();
  });
});
