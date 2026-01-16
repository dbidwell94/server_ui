import React from "react";

interface TextInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

export default function TextInput({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  helperText,
}: TextInputProps) {
  const isError = helperText && helperText.length > 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg outline-none transition bg-slate-700 text-white placeholder-slate-400 disabled:bg-slate-600 disabled:cursor-not-allowed ${
          isError
            ? "border-red-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            : "border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        }`}
      />
      {helperText && (
        <p className={`text-xs mt-1 ${isError ? "text-red-400 font-medium" : "text-gray-400"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
