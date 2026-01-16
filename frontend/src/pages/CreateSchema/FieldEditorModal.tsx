import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import SelectInput from "../../components/SelectInput";
import CheckboxInput from "../../components/CheckboxInput";
import Button from "../../components/Button";
import TypeSpecificConfig from "./TypeSpecificConfig";
import type { DynamicField, ArgumentType } from "./types";

interface FieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: DynamicField) => void;
  initialField?: DynamicField;
}

const DEFAULT_FIELD: DynamicField = {
  name: "",
  flag: "",
  useEquals: false,
  type: "string",
  stringConfig: {},
  numberConfig: {},
  enumConfig: { values: [] },
  default: "",
  required: false,
  description: "",
  displayName: "",
};

export default function FieldEditorModal({
  isOpen,
  onClose,
  onSave,
  initialField,
}: FieldEditorModalProps) {
  const [field, setField] = useState<DynamicField>(initialField || DEFAULT_FIELD);

  useEffect(() => {
    if (isOpen) {
      setField(initialField || DEFAULT_FIELD);
    }
  }, [isOpen, initialField]);

  const handleChange = (key: keyof DynamicField, value: any) => {
    setField((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!field.name || !field.flag || !field.description) {
      alert("Please fill in name, flag, and description");
      return;
    }
    onSave(field);
    setField(DEFAULT_FIELD);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Create Field</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              id="field-name"
              name="fieldName"
              label="Name"
              value={field.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., maxPlayers"
            />
            <TextInput
              id="field-flag"
              name="fieldFlag"
              label="Flag"
              value={field.flag}
              onChange={(e) => handleChange("flag", e.target.value)}
              placeholder="e.g., --max-players"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={field.type}
                onChange={(e) => handleChange("type", e.target.value as ArgumentType)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 hover:border-slate-500 focus:border-blue-500 outline-none transition"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="enum">Enum</option>
                <option value="flag">Flag</option>
              </select>
            </div>

            {/* Dynamic Default Value Field */}
            <div>
              {field.type === "boolean" || field.type === "flag" ? (
                <CheckboxInput
                  id="field-default-bool"
                  name="fieldDefaultBool"
                  label="Enabled by default"
                  checked={field.default === "true"}
                  onChange={(e) => handleChange("default", e.target.checked ? "true" : "")}
                />
              ) : field.type === "enum" ? (
                <SelectInput
                  id="field-default-enum"
                  name="fieldDefaultEnum"
                  label="Default Value"
                  value={field.default || ""}
                  onChange={(e) => handleChange("default", e.target.value)}
                  options={[
                    { value: "", label: "None" },
                    ...(field.enumConfig?.values.map((val) => ({ value: val, label: val })) || []),
                  ]}
                />
              ) : field.type === "number" ? (
                <NumberInput
                  id="field-default-number"
                  name="fieldDefaultNumber"
                  label="Default Value"
                  value={field.default || ""}
                  onChange={(e) => handleChange("default", e.target.value)}
                  min={field.numberConfig?.min}
                  max={field.numberConfig?.max}
                  placeholder="Optional"
                />
              ) : (
                <TextInput
                  id="field-default"
                  name="fieldDefault"
                  label="Default Value"
                  value={field.default || ""}
                  onChange={(e) => handleChange("default", e.target.value)}
                  placeholder="Optional"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              id="field-description"
              name="fieldDescription"
              label="Description"
              value={field.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="What does this argument do?"
            />
            <TextInput
              id="field-display-name"
              name="fieldDisplayName"
              label="Display Name"
              value={field.displayName || ""}
              onChange={(e) => handleChange("displayName", e.target.value)}
              placeholder="Optional UI name"
            />
          </div>

          <TypeSpecificConfig field={field} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CheckboxInput
              id="field-use-equals"
              name="fieldUseEquals"
              label="Use equals (flag=value)"
              checked={field.useEquals}
              onChange={(e) => handleChange("useEquals", e.target.checked)}
            />
            <CheckboxInput
              id="field-required"
              name="fieldRequired"
              label="Required"
              checked={field.required}
              onChange={(e) => handleChange("required", e.target.checked)}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-700">
          <Button onClick={onClose} variant="secondary" maxWidth={false}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" maxWidth={false}>
            Save Field
          </Button>
        </div>
      </div>
    </div>
  );
}
