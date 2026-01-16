import React from "react";

interface SelectInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

export default function SelectInput({
  id,
  name,
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "",
  helperText,
}: SelectInputProps) {
  const isError = helperText && helperText.length > 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-slate-700 text-white rounded border outline-none transition ${
          isError
            ? "border-red-500 focus:border-red-400"
            : "border-slate-600 hover:border-slate-500 focus:border-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className={`text-sm mt-1 ${isError ? "text-red-400" : "text-gray-400"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
