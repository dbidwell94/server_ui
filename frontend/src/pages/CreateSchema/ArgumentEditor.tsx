import { useState } from "react";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import SelectInput from "../../components/SelectInput";
import CheckboxInput from "../../components/CheckboxInput";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TypeSpecificConfig from "./TypeSpecificConfig";
import type { DynamicField } from "../../bindings";

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

  const handleTypeSpecificChange = (updatedField: DynamicField) => {
    // Convert the full field update back to the onChange format
    onChange("type", updatedField as any);
  };

  const renderFieldPreview = () => {
    const label = field.displayName || field.name;

    switch (field.type) {
      case "boolean":
        return (
          <CheckboxInput
            id="preview-field"
            name="previewField"
            label={label}
            checked={false}
            onChange={() => {}}
            disabled
          />
        );

      case "enum": {
        const enumField = field as Extract<DynamicField, { type: "enum" }>;
        return (
          <SelectInput
            id="preview-enum"
            name="previewEnum"
            label={label}
            value=""
            onChange={() => {}}
            disabled
            options={[
              { value: "", label: "Select an option" },
              ...(enumField.values && enumField.values.length > 0
                ? enumField.values.map((v: string) => ({ value: v, label: v }))
                : []),
            ]}
          />
        );
      }

      case "flag":
        return (
          <CheckboxInput
            id="preview-flag"
            name="previewFlag"
            label={label}
            checked={false}
            onChange={() => {}}
            disabled
          />
        );

      case "number":
        return (
          <NumberInput
            id="preview-number"
            name="previewNumber"
            label={label}
            value=""
            onChange={() => {}}
            placeholder={field.default || "Enter a number"}
            disabled
          />
        );

      default: // string
        return (
          <TextInput
            id="preview-string"
            name="previewString"
            label={label}
            value=""
            onChange={() => {}}
            placeholder={field.default || `e.g., ${field.name}`}
            disabled
          />
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
            value={field.flag || ""}
            onChange={(e) => onChange("flag", e.target.value)}
            placeholder="e.g., --max-players"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SelectInput
          id="field-type"
          name="fieldType"
          label="Type"
          value={field.type}
          onChange={(e) => onChange("type", e.target.value)}
          options={[
            { value: "string", label: "String" },
            { value: "number", label: "Number" },
            { value: "boolean", label: "Boolean" },
            { value: "enum", label: "Enum" },
            { value: "flag", label: "Flag" },
          ]}
        />

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
      <TypeSpecificConfig field={field} onChange={handleTypeSpecificChange} />

      <div className="flex flex-wrap gap-6 mb-6">
        <CheckboxInput
          id="field-use-equals"
          name="fieldUseEquals"
          label="Use equals (flag=value)"
          checked={field.useEquals}
          onChange={(e) => onChange("useEquals", e.target.checked)}
        />

        <CheckboxInput
          id="field-required"
          name="fieldRequired"
          label="Required"
          checked={field.required}
          onChange={(e) => onChange("required", e.target.checked)}
        />
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
