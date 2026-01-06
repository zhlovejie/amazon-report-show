import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

const colorClasses: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    outline: "bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600",
    ghost: "bg-transparent hover:bg-blue-50 text-blue-600 border-transparent",
  },
  secondary: {
    solid: "bg-gray-600 hover:bg-gray-700 text-white border-gray-600",
    outline: "bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 border-transparent",
  },
  success: {
    solid: "bg-green-600 hover:bg-green-700 text-white border-green-600",
    outline: "bg-transparent hover:bg-green-50 text-green-600 border-green-600",
    ghost: "bg-transparent hover:bg-green-50 text-green-600 border-transparent",
  },
  danger: {
    solid: "bg-red-600 hover:bg-red-700 text-white border-red-600",
    outline: "bg-transparent hover:bg-red-50 text-red-600 border-red-600",
    ghost: "bg-transparent hover:bg-red-50 text-red-600 border-transparent",
  },
  warning: {
    solid: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
    outline:
      "bg-transparent hover:bg-yellow-50 text-yellow-600 border-yellow-500",
    ghost:
      "bg-transparent hover:bg-yellow-50 text-yellow-600 border-transparent",
  },
  info: {
    solid: "bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500",
    outline: "bg-transparent hover:bg-cyan-50 text-cyan-600 border-cyan-500",
    ghost: "bg-transparent hover:bg-cyan-50 text-cyan-600 border-transparent",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
  xl: "px-6 py-3.5 text-base",
};

const roundedClasses: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "solid",
  color = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = "md",
  disabled,
  className = "",
  type = "button",
  ...rest
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border";

  const variantColorClasses = colorClasses[color][variant];
  const variantFocusRing = `focus:ring-${color}-500`;

  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[rounded];

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const finalClasses = twMerge(
    baseClasses,
    variantColorClasses,
    variantFocusRing,
    sizeClass,
    roundedClass,
    widthClass,
    disabledClass,
    className
  );

  return (
    <button
      type={type}
      className={finalClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

      {children}

      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
