import React from "react";

interface NumberInputProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  min?: number;
  max?: number;
}

export default function NumberInput({
  id,
  name,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  helperText,
  min,
  max,
}: NumberInputProps) {
  const isError = helperText && helperText.length > 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full px-3 py-2 bg-slate-700 text-white rounded border outline-none transition ${
          isError
            ? "border-red-500 focus:border-red-400"
            : "border-slate-600 hover:border-slate-500 focus:border-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {helperText && (
        <p className={`text-sm mt-1 ${isError ? "text-red-400" : "text-gray-400"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
