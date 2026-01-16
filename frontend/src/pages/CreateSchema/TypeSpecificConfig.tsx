import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import Button from "../../components/Button";
import type { DynamicField } from "../../bindings";

interface TypeSpecificConfigProps {
  field: DynamicField;
  onChange: (field: DynamicField) => void;
}

export default function TypeSpecificConfig({
  field,
  onChange,
}: TypeSpecificConfigProps) {
  if (field.type === "string") {
    const stringField = field as Extract<DynamicField, { type: "string" }>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-700 rounded">
        <TextInput
          id="string-pattern"
          name="stringPattern"
          label="Pattern (regex)"
          value={stringField.pattern || ""}
          onChange={(e) => {
            const updatedField: DynamicField = {
              ...stringField,
              pattern: e.target.value || null,
            } as DynamicField;
            onChange(updatedField);
          }}
          placeholder="Optional regex pattern"
        />
        <NumberInput
          id="string-min-length"
          name="stringMinLength"
          label="Min Length"
          value={stringField.minLength?.toString() || ""}
          onChange={(e) => {
            const updatedField: DynamicField = {
              ...stringField,
              minLength: e.target.value ? parseInt(e.target.value) : null,
            } as DynamicField;
            onChange(updatedField);
          }}
          placeholder="Optional"
        />
        <NumberInput
          id="string-max-length"
          name="stringMaxLength"
          label="Max Length"
          value={stringField.maxLength?.toString() || ""}
          onChange={(e) => {
            const updatedField: DynamicField = {
              ...stringField,
              maxLength: e.target.value ? parseInt(e.target.value) : null,
            } as DynamicField;
            onChange(updatedField);
          }}
          placeholder="Optional"
        />
      </div>
    );
  }

  if (field.type === "number") {
    const numberField = field as Extract<DynamicField, { type: "number" }>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-700 rounded">
        <NumberInput
          id="number-min"
          name="numberMin"
          label="Minimum"
          value={numberField.min?.toString() || ""}
          onChange={(e) => {
            const updatedField: DynamicField = {
              ...numberField,
              min: e.target.value ? parseFloat(e.target.value) : null,
            } as DynamicField;
            onChange(updatedField);
          }}
          placeholder="Optional"
        />
        <NumberInput
          id="number-max"
          name="numberMax"
          label="Maximum"
          value={numberField.max?.toString() || ""}
          onChange={(e) => {
            const updatedField: DynamicField = {
              ...numberField,
              max: e.target.value ? parseFloat(e.target.value) : undefined,
            } as DynamicField;
            onChange(updatedField);
          }}
          placeholder="Optional"
        />
      </div>
    );
  }

  if (field.type === "enum") {
    const enumField = field as Extract<DynamicField, { type: "enum" }>;
    return (
      <div className="mb-6 p-4 bg-slate-700 rounded">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Enum Values
        </label>
        <div className="space-y-2 mb-3">
          {enumField.values && enumField.values.length > 0
            ? enumField.values.map((value: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <TextInput
                    id={`enum-value-${idx}`}
                    name={`enumValue${idx}`}
                    label=""
                    value={value}
                    onChange={(e) => {
                      const newValues = [...(enumField.values || [])];
                      newValues[idx] = e.target.value;
                      const updatedField: DynamicField = {
                        ...enumField,
                    values: newValues,
                  } as DynamicField;
                  onChange(updatedField);
                }}
                placeholder="Enum value"
                fullWidth
              />
              <Button
                onClick={() => {
                  const newValues = (enumField.values || []).filter(
                    (_, i) => i !== idx
                  );
                  const updatedField: DynamicField = {
                    ...enumField,
                    values: newValues,
                  } as DynamicField;
                  onChange(updatedField);
                }}
                variant="danger"
                maxWidth={false}
              >
                Remove
              </Button>
            </div>
              ))
            : (
              <p className="text-gray-400">No enum values yet</p>
            )}
        </div>
        <Button
          onClick={() => {
            const updatedField: DynamicField = {
              ...enumField,
              values: [...(enumField.values || []), ""],
            } as DynamicField;
            onChange(updatedField);
          }}
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
