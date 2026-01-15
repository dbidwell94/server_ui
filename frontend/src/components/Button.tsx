import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
};

export default function Button({
  type = "button",
  onClick,
  disabled = false,
  isLoading = false,
  loadingText,
  children,
  className = "",
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
