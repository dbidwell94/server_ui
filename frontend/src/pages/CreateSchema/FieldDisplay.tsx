import { useState } from "react";
import { EllipsisVerticalIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";
import NumberInput from "../../components/NumberInput";
import CheckboxInput from "../../components/CheckboxInput";
import type { DynamicField } from "../../bindings";

interface FieldDisplayProps {
  field: DynamicField;
  onDelete: () => void;
  onEdit: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

export default function FieldDisplay({
  field,
  onDelete,
  onEdit,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
}: FieldDisplayProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const label = field.displayName || field.name;

  const renderField = () => {
    switch (field.type) {
      case "boolean":
        return (
          <CheckboxInput
            id={field.name}
            name={field.name}
            label={label}
            checked={false}
            onChange={() => {}}
          />
        );

      case "enum": {
        const enumField = field as Extract<DynamicField, { type: "enum" }>;
        return (
          <SelectInput
            id={field.name}
            name={field.name}
            label={label}
            value=""
            onChange={() => {}}
            options={[
              { value: "", label: "Select an option" },
              ...(enumField.values && enumField.values.length > 0
                ? enumField.values.map((value: string) => ({ value: value, label: value }))
                : []),
            ]}
          />
        );
      }

      case "flag":
        return (
          <CheckboxInput
            id={field.name}
            name={field.name}
            label={label}
            checked={false}
            onChange={() => {}}
          />
        );

      case "number":
        return (
          <NumberInput
            id={field.name}
            name={field.name}
            label={label}
            value=""
            onChange={() => {}}
            placeholder={field.default || "Enter a number"}
          />
        );

      default: // string
        return (
          <TextInput
            id={field.name}
            name={field.name}
            label={label}
            value=""
            onChange={() => {}}
            placeholder={field.default || `e.g., ${field.name}`}
          />
        );
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg relative transition cursor-grab ${
        isDragging ? "bg-blue-900/50 border-blue-500 opacity-50 cursor-grabbing" : "bg-slate-800/50 border-slate-700"
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {/* Dropdown Menu */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-1 text-slate-400 hover:text-white transition"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded shadow-lg z-10">
            <button
              onClick={() => {
                onEdit();
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">{renderField()}</div>
      <p className="text-xs text-gray-400">{field.description}</p>
    </div>
  );
}
