import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConceptSelector } from "../../components/ConceptSelector/ConceptSelector";
import type { ConceptMeta } from "../../types/domain";

const mockConcepts: ConceptMeta[] = [
  { id: "vs-1", name: "INTEGRATE Vasopressors", version: "2", author: "J. Smith", approval: "Approved 2025-03-18" },
  { id: "vs-2", name: "INTEGRATE Lactate Codes", version: "1", author: "J. Smith", approval: "Approved 2024-11-01" },
  { id: "vs-3", name: "LOQ Systolic BP Codes",   version: "1", author: "LOQ Team", approval: "Approved 2024-11-01" },
];

const defaultProps = {
  concepts: mockConcepts,
  currentConcept: null,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConceptSelector", () => {
  it("renders all concepts in the list", () => {
    render(<ConceptSelector {...defaultProps} />);
    expect(screen.getByText("INTEGRATE Vasopressors")).toBeInTheDocument();
    expect(screen.getByText("INTEGRATE Lactate Codes")).toBeInTheDocument();
    expect(screen.getByText("LOQ Systolic BP Codes")).toBeInTheDocument();
  });

  it("filters concepts as user types in the search box", async () => {
    render(<ConceptSelector {...defaultProps} />);
    const input = screen.getByTestId("concept-search-input");
    await userEvent.type(input, "Lactate");
    expect(screen.getByText("INTEGRATE Lactate Codes")).toBeInTheDocument();
    expect(screen.queryByText("INTEGRATE Vasopressors")).not.toBeInTheDocument();
  });

  it("shows empty state message when search has no matches", async () => {
    render(<ConceptSelector {...defaultProps} />);
    await userEvent.type(screen.getByTestId("concept-search-input"), "zzz-no-match");
    expect(screen.getByText(/no concepts match/i)).toBeInTheDocument();
  });

  it("marks the currentConcept as pre-selected", () => {
    render(<ConceptSelector {...defaultProps} currentConcept={mockConcepts[1]} />);
    const selectedItem = screen.getByTestId(`concept-option-${mockConcepts[1].id}`);
    expect(selectedItem).toHaveAttribute("aria-selected", "true");
  });

  it("calls onConfirm with the selected concept on confirm click", async () => {
    const onConfirm = vi.fn();
    render(<ConceptSelector {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId("concept-option-vs-1"));
    fireEvent.click(screen.getByTestId("confirm-concept-btn"));
    expect(onConfirm).toHaveBeenCalledWith(mockConcepts[0]);
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<ConceptSelector {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("Confirm button is disabled when no concept is selected", () => {
    render(<ConceptSelector {...defaultProps} currentConcept={null} />);
    expect(screen.getByTestId("confirm-concept-btn")).toBeDisabled();
  });

  it("Confirm button is enabled after selecting a concept", async () => {
    render(<ConceptSelector {...defaultProps} currentConcept={null} />);
    fireEvent.click(screen.getByTestId("concept-option-vs-2"));
    expect(screen.getByTestId("confirm-concept-btn")).not.toBeDisabled();
  });
});
