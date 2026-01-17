import React from "react";

interface TextInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  fullWidth?: boolean;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
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
  fullWidth = false,
  textarea = false,
  rows = 3,
  required = false,
}: TextInputProps) {
  const isError = helperText && helperText.length > 0;
  const baseClassName = `w-full px-4 py-2 border rounded-lg outline-none transition bg-slate-700 text-white placeholder-slate-400 disabled:bg-slate-600 disabled:cursor-not-allowed ${
    isError
      ? "border-red-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
      : "border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  }`;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={`${baseClassName} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={baseClassName}
        />
      )}
      {helperText && (
        <p
          className={`text-xs mt-1 ${isError ? "text-red-400 font-medium" : "text-gray-400"}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
