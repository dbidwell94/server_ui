import { useState } from "react";
import TextInput from "../../components/TextInput";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TypeSpecificConfig from "./TypeSpecificConfig";
import type { DynamicField, ArgumentType } from "./types";

interface ArgumentEditorProps {
  field: DynamicField;
  onChange: (key: keyof DynamicField, value: any) => void;
  onAddField: () => void;
}

export default function ArgumentEditor({
  field,
  onChange,
  onAddField,
}: ArgumentEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const renderFieldPreview = () => {
    const label = field.displayName || field.name;
    const isRequired = field.required ? "*" : "";

    switch (field.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preview-field"
              className="w-4 h-4"
              disabled
            />
            <label htmlFor="preview-field" className="text-gray-300">
              {label}
              {isRequired && <span className="text-red-500">{isRequired}</span>}
            </label>
          </div>
        );

      case "enum":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
              {isRequired && <span className="text-red-500">{isRequired}</span>}
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
              disabled
            >
              <option value="">Select an option</option>
              {field.enumConfig?.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        );

      case "flag":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preview-flag"
              className="w-4 h-4"
              disabled
            />
            <label htmlFor="preview-flag" className="text-gray-300">
              {label}
              {isRequired && <span className="text-red-500">{isRequired}</span>}
            </label>
          </div>
        );

      case "number":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
              {isRequired && <span className="text-red-500">{isRequired}</span>}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
              placeholder={field.default || "Enter a number"}
              disabled
            />
          </div>
        );

      default: // string
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
              {isRequired && <span className="text-red-500">{isRequired}</span>}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
              placeholder={field.default || `e.g., ${field.name}`}
              disabled
            />
          </div>
        );
    }
  };

  if (isPreview) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-white mb-6">Preview: {field.displayName || field.name}</h2>
        <div className="mb-6 p-4 bg-slate-800 rounded border border-slate-700">
          {renderFieldPreview()}
        </div>
        <p className="text-sm text-gray-400 mb-4">
          <strong>Description:</strong> {field.description}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsPreview(false)}
            variant="secondary"
            maxWidth={false}
          >
            Back to Edit
          </Button>
          <Button
            onClick={() => {
              onAddField();
              setIsPreview(false);
            }}
            variant="primary"
            maxWidth={false}
          >
            Confirm & Add
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-white mb-6">Add Argument</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <TextInput
            id="field-name"
            name="fieldName"
            label="Name"
            value={field.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g., maxPlayers"
          />
        </div>

        <div>
          <TextInput
            id="field-flag"
            name="fieldFlag"
            label="Flag"
            value={field.flag}
            onChange={(e) => onChange("flag", e.target.value)}
            placeholder="e.g., --max-players"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            value={field.type}
            onChange={(e) => onChange("type", e.target.value as ArgumentType)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 hover:border-slate-500 focus:border-blue-500 outline-none transition"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="enum">Enum</option>
            <option value="flag">Flag</option>
          </select>
        </div>

        <div>
          <TextInput
            id="field-default"
            name="fieldDefault"
            label="Default Value"
            value={field.default || ""}
            onChange={(e) => onChange("default", e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <TextInput
            id="field-description"
            name="fieldDescription"
            label="Description"
            value={field.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="What does this argument do?"
          />
        </div>

        <div>
          <TextInput
            id="field-display-name"
            name="fieldDisplayName"
            label="Display Name"
            value={field.displayName || ""}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder="Optional UI name"
          />
        </div>
      </div>

      {/* Type-specific configuration */}
      <TypeSpecificConfig field={field} onChange={onChange} />

      <div className="flex flex-wrap gap-6 mb-6">
        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={field.useEquals}
            onChange={(e) => onChange("useEquals", e.target.checked)}
            className="w-4 h-4"
          />
          Use equals (flag=value)
        </label>

        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange("required", e.target.checked)}
            className="w-4 h-4"
          />
          Required
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setIsPreview(true)}
          variant="secondary"
          maxWidth={false}
        >
          Preview
        </Button>
        <Button
          onClick={onAddField}
          variant="primary"
          maxWidth={false}
        >
          Add Argument
        </Button>
      </div>
    </Card>
  );
}
