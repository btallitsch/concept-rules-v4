import React from "react";
import type { RuleRow } from "../../types/domain";
import type { FhirResourceType } from "../../types/fhir";
import type { LogicOperator, ValueOperator } from "../../types/domain";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import {
  SUPPORTED_RECORD_TYPES,
  COLUMNS_BY_RECORD_TYPE,
  VALUE_OPERATORS,
} from "../../constants/fhir";

interface RulesTableProps {
  rows: RuleRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<RuleRow, "id">>) => void;
}

const LOGIC_OPTIONS: LogicOperator[] = ["AND", "OR"];

export const RulesTable: React.FC<RulesTableProps> = ({
  rows,
  onAdd,
  onRemove,
  onUpdate,
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    {/* Section header */}
    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
      <span className="text-sm font-bold text-slate-800">Rules</span>
      <Button variant="subtle" size="sm" onClick={onAdd} data-testid="add-row-btn">
        + Add Row
      </Button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse" data-testid="rules-table">
        <thead>
          <tr className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-2.5 text-left font-semibold w-24">Logic</th>
            <th className="px-4 py-2.5 text-left font-semibold">Record Type</th>
            <th className="px-4 py-2.5 text-left font-semibold">Column</th>
            <th className="px-4 py-2.5 text-left font-semibold w-36">Operator</th>
            <th className="px-4 py-2.5 text-left font-semibold">Values</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <RuleRowComponent
              key={row.id}
              row={row}
              isFirst={index === 0}
              onRemove={() => onRemove(row.id)}
              onUpdate={(patch) => onUpdate(row.id, patch)}
            />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                No rules defined. Click <strong>+ Add Row</strong> to begin.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Rule Row ────────────────────────────────────────────────────────────────

interface RuleRowProps {
  row: RuleRow;
  isFirst: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<Omit<RuleRow, "id">>) => void;
}

const RuleRowComponent: React.FC<RuleRowProps> = ({
  row,
  isFirst,
  onRemove,
  onUpdate,
}) => {
  const columnOptions = COLUMNS_BY_RECORD_TYPE[row.recordType];

  return (
    <tr
      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
      data-testid={`rule-row-${row.id}`}
    >
      {/* Logic */}
      <td className="px-4 py-2">
        {isFirst ? (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
            WHERE
          </span>
        ) : (
          <Select
            options={LOGIC_OPTIONS}
            value={row.logic}
            variant="logic"
            aria-label="Logic operator"
            onChange={(e) =>
              onUpdate({ logic: e.target.value as LogicOperator })
            }
          />
        )}
      </td>

      {/* Record Type */}
      <td className="px-4 py-2">
        <Select
          options={SUPPORTED_RECORD_TYPES}
          value={row.recordType}
          aria-label="Record type"
          onChange={(e) =>
            onUpdate({ recordType: e.target.value as FhirResourceType })
          }
        />
      </td>

      {/* Column */}
      <td className="px-4 py-2">
        <Select
          options={columnOptions}
          value={row.column}
          aria-label="Column"
          onChange={(e) => onUpdate({ column: e.target.value })}
        />
      </td>

      {/* Operator */}
      <td className="px-4 py-2">
        <Select
          options={VALUE_OPERATORS}
          value={row.operator}
          aria-label="Operator"
          onChange={(e) =>
            onUpdate({ operator: e.target.value as ValueOperator })
          }
        />
      </td>

      {/* Value */}
      <td className="px-4 py-2">
        <input
          className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={row.value}
          aria-label="Values"
          placeholder="e.g. Norepinephrine, Vasopressin…"
          onChange={(e) => onUpdate({ value: e.target.value })}
        />
      </td>

      {/* Remove */}
      <td className="px-2 py-2 text-center">
        <Button
          variant="danger"
          size="sm"
          aria-label="Remove row"
          onClick={onRemove}
          className="!px-2 !py-1"
        >
          ✕
        </Button>
      </td>
    </tr>
  );
};
