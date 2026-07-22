import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  label?: string;
  variant?: "default" | "logic" | "tiny";
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  variant = "default",
  className,
  ...props
}) => {
  const base =
    "border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";
  const variants: Record<string, string> = {
    default: "border-slate-200 bg-white text-slate-700 px-2 py-1 w-full",
    logic: "border-blue-200 bg-blue-50 text-blue-800 font-semibold px-2 py-1",
    tiny: "border-slate-200 bg-white text-slate-600 px-1 py-0.5 text-xs",
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <select className={`${base} ${variants[variant]}`} {...props}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
};
