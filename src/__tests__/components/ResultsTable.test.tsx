import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ResultsTable } from "../../components/ResultsTable/ResultsTable";
import type { QueryResult } from "../../types/domain";
import type { PagedQueryResult } from "../../data/fhirApi";
import type { ResultRecordDetail } from "../../types/domain";

const records: ResultRecordDetail[] = [
  { id: "RX-001", name: "Norepinephrine", codes: "3992", adminRoute: "IV",   frequency: "Continuous", status: "active",    drugClass: "Vasopressor" },
  { id: "RX-002", name: "Epinephrine",    codes: "3498", adminRoute: "IV",   frequency: "PRN",        status: "active",    drugClass: "Vasopressor" },
  { id: "RX-003", name: "Nitroglycerin",  codes: "7454", adminRoute: "Oral", frequency: "PRN",        status: "completed", drugClass: "Vasodilator" },
  { id: "RX-004", name: "Hydralazine",    codes: "5470", adminRoute: "IV",   frequency: "Q6H",        status: "on-hold",   drugClass: "Vasodilator" },
];

const mockResult: PagedQueryResult = {
  records,
  totalCount: 4,
  executedAt: new Date().toISOString(),
  page: 1,
  pageSize: 5,
  pageCount: 1,
};

const defaultProps = {
  result: mockResult,
  conceptName: "INTEGRATE Vasopressors",
  search: "",
  statusFilter: "all",
  sortKey: "id" as keyof ResultRecordDetail,
  sortDir: "asc" as const,
  page: 1,
  pageSize: 5,
  loading: false,
  onSearch: vi.fn(),
  onStatusFilter: vi.fn(),
  onSort: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  onParamsChange: vi.fn(),
};

// Wrap in MemoryRouter so useNavigate works
const renderTable = (props = defaultProps) =>
  render(<MemoryRouter><ResultsTable {...props} /></MemoryRouter>);

describe("ResultsTable", () => {
  it("renders all records", () => {
    renderTable();
    expect(screen.getByText("Norepinephrine")).toBeInTheDocument();
    expect(screen.getByText("Epinephrine")).toBeInTheDocument();
    expect(screen.getByText("Nitroglycerin")).toBeInTheDocument();
    expect(screen.getByText("Hydralazine")).toBeInTheDocument();
  });

  it("shows total count badge", () => {
    renderTable();
    expect(screen.getByText("4 total")).toBeInTheDocument();
  });

  it("calls onSearch when typing in search input", async () => {
    const onSearch = vi.fn();
    renderTable({ ...defaultProps, onSearch });
    await userEvent.type(screen.getByTestId("results-search-input"), "Epi");
    expect(onSearch).toHaveBeenCalled();
  });

  it("calls onStatusFilter when status dropdown changes", () => {
    const onStatusFilter = vi.fn();
    renderTable({ ...defaultProps, onStatusFilter });
    fireEvent.change(screen.getByTestId("status-filter"), { target: { value: "completed" } });
    expect(onStatusFilter).toHaveBeenCalledWith("completed");
  });

  it("calls onSort when a sortable column header is clicked", () => {
    const onSort = vi.fn();
    renderTable({ ...defaultProps, onSort });
    fireEvent.click(screen.getByText(/^Name/));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("reverses sort direction when clicking same column again", () => {
    const onSort = vi.fn();
    // Already sorted by name asc
    renderTable({ ...defaultProps, onSort, sortKey: "name", sortDir: "asc" });
    fireEvent.click(screen.getByText(/^Name/));
    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("calls clear-filter handlers when 'Clear filters' link is clicked", async () => {
    const onSearch = vi.fn();
    const onStatusFilter = vi.fn();
    // Render with active search so Clear filters appears
    renderTable({ ...defaultProps, onSearch, onStatusFilter, search: "test" });
    fireEvent.click(screen.getByText("Clear filters"));
    expect(onSearch).toHaveBeenCalledWith("");
    expect(onStatusFilter).toHaveBeenCalledWith("all");
  });

  it("shows empty-state message when records array is empty", () => {
    renderTable({
      ...defaultProps,
      result: { ...mockResult, records: [], totalCount: 0 },
    });
    expect(screen.getByTestId("no-results-msg")).toBeInTheDocument();
  });

  it("renders the Export CSV button", () => {
    renderTable();
    expect(screen.getByTestId("export-csv-btn")).toBeInTheDocument();
  });

  it("renders a detail arrow for each row", () => {
    renderTable();
    const arrows = screen.getAllByRole("button", { name: /view detail/i });
    expect(arrows).toHaveLength(records.length);
  });

  it("renders drug class pills", () => {
    renderTable();
    expect(screen.getAllByText("Vasopressor").length).toBeGreaterThan(0);
  });

  it("calls onSearch when clear-input ✕ button is clicked", async () => {
    const onSearch = vi.fn();
    renderTable({ ...defaultProps, onSearch, search: "something" });
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("passes pagination props to the Pagination component", () => {
    renderTable({ ...defaultProps, page: 2, pageSize: 5, result: { ...mockResult, pageCount: 4, totalCount: 20 } });
    expect(screen.getByText("6–10 of 20 records")).toBeInTheDocument();
  });

  it("calls onPageChange when pagination page is clicked", () => {
    const onPageChange = vi.fn();
    renderTable({
      ...defaultProps,
      onPageChange,
      page: 1,
      pageSize: 5,
      result: { ...mockResult, pageCount: 4, totalCount: 20 },
    });
    fireEvent.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("shows loading indicator when loading=true", () => {
    renderTable({ ...defaultProps, loading: true });
    expect(screen.getByText("Fetching…")).toBeInTheDocument();
  });
});
