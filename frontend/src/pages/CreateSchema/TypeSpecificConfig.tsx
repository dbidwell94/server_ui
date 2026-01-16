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
    const displayNames = enumField.displayNames || {};

    return (
      <div className="mb-6 p-4 bg-slate-700 rounded">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Enum Values
        </label>
        <div className="space-y-4 mb-3">
          {enumField.values && enumField.values.length > 0 ? (
            enumField.values.map((value: string, idx: number) => (
              <div
                key={`${value}-${idx}`}
                className="space-y-2 p-3 bg-slate-800 rounded border border-slate-600"
              >
                <div className="flex gap-2">
                  <TextInput
                    id={`enum-value-${idx}`}
                    name={`enumValue${idx}`}
                    label="Value"
                    value={value}
                    onChange={(e) => {
                      const oldValue = value;
                      const newValue = e.target.value;
                      const newValues = [...(enumField.values || [])];
                      newValues[idx] = newValue;

                      // Update displayNames mapping: remove old key, update with new key if display name exists
                      const newDisplayNames = { ...displayNames };
                      if (oldValue !== newValue && displayNames[oldValue]) {
                        newDisplayNames[newValue] = displayNames[oldValue];
                        delete newDisplayNames[oldValue];
                      }

                      const updatedField: DynamicField = {
                        ...enumField,
                        values: newValues,
                        displayNames:
                          Object.keys(newDisplayNames).length > 0
                            ? newDisplayNames
                            : undefined,
                      } as DynamicField;
                      onChange(updatedField);
                    }}
                    placeholder="Enum value"
                    fullWidth
                  />
                  <Button
                    onClick={() => {
                      const removedValue = enumField.values?.[idx];
                      const newValues = (enumField.values || []).filter(
                        (_, i) => i !== idx
                      );

                      // Clean up displayNames for the removed value
                      const newDisplayNames = { ...displayNames };
                      if (removedValue && newDisplayNames[removedValue]) {
                        delete newDisplayNames[removedValue];
                      }

                      const updatedField: DynamicField = {
                        ...enumField,
                        values: newValues,
                        displayNames:
                          Object.keys(newDisplayNames).length > 0
                            ? newDisplayNames
                            : undefined,
                      } as DynamicField;
                      onChange(updatedField);
                    }}
                    variant="danger"
                    maxWidth={false}
                  >
                    Remove
                  </Button>
                </div>
                <TextInput
                  id={`enum-display-name-${idx}`}
                  name={`enumDisplayName${idx}`}
                  label="Display Name (Optional)"
                  value={displayNames[value] || ""}
                  onChange={(e) => {
                    const newDisplayNames = { ...displayNames };
                    if (e.target.value) {
                      newDisplayNames[value] = e.target.value;
                    } else {
                      delete newDisplayNames[value];
                    }
                    const updatedField: DynamicField = {
                      ...enumField,
                      displayNames:
                        Object.keys(newDisplayNames).length > 0
                          ? newDisplayNames
                          : undefined,
                    } as DynamicField;
                    onChange(updatedField);
                  }}
                  placeholder={`Default: ${value}`}
                  fullWidth
                />
              </div>
            ))
          ) : (
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
