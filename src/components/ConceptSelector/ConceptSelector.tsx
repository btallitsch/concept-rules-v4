import React, { useState, useEffect, useRef } from "react";
import type { ConceptMeta } from "../../types/domain";
import { Button } from "../ui/Button";

interface ConceptSelectorProps {
  concepts: ConceptMeta[];
  currentConcept: ConceptMeta | null;
  onConfirm: (concept: ConceptMeta) => void;
  onCancel: () => void;
}

export const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  concepts,
  currentConcept,
  onConfirm,
  onCancel,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ConceptMeta | null>(currentConcept);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = concepts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Select Concept"
    >
      <div className="bg-white rounded-xl w-[440px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 px-5 py-4">
          <h2 className="text-white font-bold text-sm tracking-wide">Select Concept</h2>
        </div>

        {/* Search */}
        <input
          ref={inputRef}
          data-testid="concept-search-input"
          className="border-b border-slate-200 px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:bg-white"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* List */}
        <ul
          className="overflow-y-auto flex-1"
          role="listbox"
          aria-label="Concept options"
        >
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-slate-400 text-center">
              No concepts match "{search}"
            </li>
          )}
          {filtered.map((c) => {
            const isSelected = selected?.id === c.id;
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={isSelected}
                data-testid={`concept-option-${c.id}`}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer border-b border-slate-100
                  transition-colors duration-75
                  ${isSelected ? "bg-blue-800 text-white" : "hover:bg-slate-50 text-slate-700"}
                `}
                onClick={() => setSelected(c)}
              >
                <span className="text-base leading-none">
                  {isSelected ? "●" : "○"}
                </span>
                <span>{c.name}</span>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200">
          <button
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            data-testid="confirm-concept-btn"
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
