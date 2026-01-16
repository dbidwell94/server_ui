import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import Button from "../../components/Button";
import type { DynamicField } from "./types";

interface TypeSpecificConfigProps {
  field: DynamicField;
  onChange: (key: keyof DynamicField, value: any) => void;
}

export default function TypeSpecificConfig({
  field,
  onChange,
}: TypeSpecificConfigProps) {
  if (field.type === "string") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-700 rounded">
        <TextInput
          id="string-pattern"
          name="stringPattern"
          label="Pattern (regex)"
          value={field.stringConfig?.pattern || ""}
          onChange={(e) =>
            onChange("stringConfig", {
              ...field.stringConfig,
              pattern: e.target.value || undefined,
            })
          }
          placeholder="Optional regex pattern"
        />
        <NumberInput
          id="string-min-length"
          name="stringMinLength"
          label="Min Length"
          value={field.stringConfig?.minLength?.toString() || ""}
          onChange={(e) =>
            onChange("stringConfig", {
              ...field.stringConfig,
              minLength: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
        <NumberInput
          id="string-max-length"
          name="stringMaxLength"
          label="Max Length"
          value={field.stringConfig?.maxLength?.toString() || ""}
          onChange={(e) =>
            onChange("stringConfig", {
              ...field.stringConfig,
              maxLength: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-700 rounded">
        <NumberInput
          id="number-min"
          name="numberMin"
          label="Minimum"
          value={field.numberConfig?.min?.toString() || ""}
          onChange={(e) =>
            onChange("numberConfig", {
              ...field.numberConfig,
              min: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
        <NumberInput
          id="number-max"
          name="numberMax"
          label="Maximum"
          value={field.numberConfig?.max?.toString() || ""}
          onChange={(e) =>
            onChange("numberConfig", {
              ...field.numberConfig,
              max: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          placeholder="Optional"
        />
      </div>
    );
  }

  if (field.type === "enum") {
    return (
      <div className="mb-6 p-4 bg-slate-700 rounded">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Enum Values
        </label>
        <div className="space-y-2 mb-3">
          {field.enumConfig?.values.map((value, idx) => (
            <div key={idx} className="flex gap-2">
              <TextInput
                id={`enum-value-${idx}`}
                name={`enumValue${idx}`}
                label=""
                value={value}
                onChange={(e) => {
                  const newValues = [...(field.enumConfig?.values || [])];
                  newValues[idx] = e.target.value;
                  onChange("enumConfig", {
                    values: newValues,
                  });
                }}
                placeholder="Enum value"
                fullWidth
              />
              <Button
                onClick={() => {
                  const newValues = (field.enumConfig?.values || []).filter(
                    (_, i) => i !== idx
                  );
                  onChange("enumConfig", {
                    values: newValues,
                  });
                }}
                variant="danger"
                maxWidth={false}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          onClick={() =>
            onChange("enumConfig", {
              values: [...(field.enumConfig?.values || []), ""],
            })
          }
          variant="primary"
          maxWidth={true}
        >
          Add Value
        </Button>
      </div>
    );
  }

  return null;
}
