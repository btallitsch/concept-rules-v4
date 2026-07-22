import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../../components/Pagination/Pagination";

const defaultProps = {
  page: 1,
  pageCount: 4,
  pageSize: 5,
  total: 20,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe("Pagination", () => {
  it("shows correct record range in footer", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText("1–5 of 20 records")).toBeInTheDocument();
  });

  it("shows correct range for a middle page", () => {
    render(<Pagination {...defaultProps} page={2} />);
    expect(screen.getByText("6–10 of 20 records")).toBeInTheDocument();
  });

  it("shows correct range for the last page", () => {
    render(<Pagination {...defaultProps} page={4} total={18} />);
    expect(screen.getByText("16–18 of 18 records")).toBeInTheDocument();
  });

  it("shows 'No records' when total is 0", () => {
    render(<Pagination {...defaultProps} total={0} pageCount={1} />);
    expect(screen.getByText("No records")).toBeInTheDocument();
  });

  it("calls onPageChange with correct page on number click", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page+1 on › click", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("›"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with page-1 on ‹ click", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("‹"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with 1 on « click", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("«"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with pageCount on » click", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText("»"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("disables « and ‹ on first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByText("«")).toBeDisabled();
    expect(screen.getByText("‹")).toBeDisabled();
  });

  it("disables › and » on last page", () => {
    render(<Pagination {...defaultProps} page={4} />);
    expect(screen.getByText("›")).toBeDisabled();
    expect(screen.getByText("»")).toBeDisabled();
  });

  it("calls onPageSizeChange when rows-per-page select changes", () => {
    const onPageSizeChange = vi.fn();
    render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "10" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });

  it("highlights the current page button", () => {
    render(<Pagination {...defaultProps} page={2} />);
    const btn = screen.getByText("2");
    expect(btn.className).toContain("bg-blue-800");
  });

  it("renders ellipsis for large page counts", () => {
    render(<Pagination {...defaultProps} page={5} pageCount={20} total={100} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
