import React from "react";

interface CheckboxInputProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  helperText?: string;
}

export default function CheckboxInput({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  helperText,
}: CheckboxInputProps) {
  const isError = helperText && helperText.length > 0;

  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-gray-300 cursor-pointer"
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`w-4 h-4 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        />
        {label}
      </label>
      {helperText && (
        <p className={`text-sm mt-1 ${isError ? "text-red-400" : "text-gray-400"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
