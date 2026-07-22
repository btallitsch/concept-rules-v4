import React from "react";

type Variant = "primary" | "ghost" | "danger" | "success" | "subtle";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-800 hover:bg-blue-900 text-white border-transparent",
  ghost:
    "bg-transparent hover:bg-white/10 text-white border border-white/40",
  danger:
    "bg-red-100 hover:bg-red-200 text-red-700 border-transparent",
  success:
    "bg-green-50 hover:bg-green-100 text-green-800 border border-green-200",
  subtle:
    "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center gap-1.5 font-semibold rounded-md
      transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-blue-400
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}
    `}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
