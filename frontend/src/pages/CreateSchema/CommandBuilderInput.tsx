import { useState, useRef } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import type { DynamicField } from "../../bindings";

interface CommandBuilderInputProps {
  value: string;
  onChange: (value: string) => void;
  fields: DynamicField[];
  staticFields?: Array<{ name: string; label: string }>;
}

export default function CommandBuilderInput({
  value,
  onChange,
  fields,
  staticFields = [],
}: CommandBuilderInputProps) {
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const insertField = (fieldName: string) => {
    if (!inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || value.length;
    const newValue = value.slice(0, cursorPos) + `{{${fieldName}}}` + value.slice(cursorPos);
    onChange(newValue);
    setShowFieldDropdown(false);

    // Restore cursor position after insertion
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPos + fieldName.length + 4, cursorPos + fieldName.length + 4);
      }
    }, 0);
  };

  const deleteField = (fieldName: string) => {
    const newValue = value.replace(`{{${fieldName}}}`, "");
    onChange(newValue);
  };

  const replaceField = (oldFieldName: string, newFieldName: string) => {
    const newValue = value.replace(`{{${oldFieldName}}}`, `{{${newFieldName}}}`);
    onChange(newValue);
  };

  // Parse template to find field references
  const fieldPattern = /\{\{(\w+)\}\}/g;
  const matches = [...value.matchAll(fieldPattern)];
  const fieldRefs = matches.map((m) => m[1]);

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded border border-slate-700">
      <h3 className="text-sm font-semibold text-gray-300">Command Template</h3>

      <div className="space-y-3">
        <div className="flex gap-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., {{executableName}} -file open"
            className="flex-1 px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded focus:outline-none focus:border-blue-500"
          />

          <div className="relative">
            <div title="Insert field template">
              <Button
                onClick={() => setShowFieldDropdown(!showFieldDropdown)}
                variant="secondary"
                maxWidth={false}
              >
                +
              </Button>
            </div>

            {showFieldDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-600 rounded shadow-lg z-10 min-w-48">
                <div className="max-h-48 overflow-y-auto">
                  {/* Static Fields */}
                  {staticFields.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-slate-800 sticky top-0">
                        Static Fields
                      </div>
                      {staticFields.map((field) => (
                        <button
                          key={`static-${field.name}`}
                          onClick={() => insertField(field.name)}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition"
                        >
                          {field.label}
                          <span className="text-xs text-gray-500 ml-2">({field.name})</span>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Dynamic Fields */}
                  {fields.length > 0 && (
                    <>
                      {staticFields.length > 0 && (
                        <div className="h-px bg-slate-700 my-1" />
                      )}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-slate-800 sticky top-0">
                        Dynamic Fields
                      </div>
                      {fields.map((field) => (
                        <button
                          key={field.name}
                          onClick={() => insertField(field.name)}
                          className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-white transition"
                        >
                          {field.displayName || field.name}
                          <span className="text-xs text-gray-500 ml-2">({field.name})</span>
                        </button>
                      ))}
                    </>
                  )}

                  {fields.length === 0 && staticFields.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">No fields available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display field references with delete/replace options */}
        {fieldRefs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Field References:</p>
            <div className="flex flex-wrap gap-2">
              {fieldRefs.map((fieldName, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-700 rounded text-sm text-blue-300"
                >
                  <span className="font-mono">{`{{${fieldName}}}`}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setShowFieldDropdown(false);
                        // Show dropdown to select replacement
                        const newField = prompt(
                          "Enter new field name:",
                          fieldName
                        );
                        if (newField && newField !== fieldName) {
                          replaceField(fieldName, newField);
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                      title="Replace with another field"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteField(fieldName)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Delete field reference"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
          <p className="text-xs text-gray-400 mb-1">Preview:</p>
          <p className="text-sm font-mono text-gray-200">{value || "(empty)"}</p>
        </div>
      </div>
    </div>
  );
}
