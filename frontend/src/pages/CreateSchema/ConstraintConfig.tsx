import CheckboxInput from "../../components/CheckboxInput";
import NumberInput from "../../components/NumberInput";
import TextInput from "../../components/TextInput";
import type { DynamicField, FieldConstraint } from "../../bindings";

interface ConstraintConfigProps {
  constraint: FieldConstraint;
  onChange: (constraint: FieldConstraint) => void;
  targetField: DynamicField;
}

export default function ConstraintConfig({
  constraint,
  onChange,
  targetField,
}: ConstraintConfigProps) {
  // Handle enum constraints
  if (constraint.type === "restrictenum" && targetField.type === "enum") {
    const restrictEnum = constraint as Extract<
      FieldConstraint,
      { type: "restrictenum" }
    >;
    const enumValues = targetField.values || [];
    const displayNames = targetField.displayNames || {};

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Allowed Values
          </label>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {enumValues && enumValues.length > 0 ? (
              enumValues.map((value) => (
                <div key={value} className="space-y-1">
                  <CheckboxInput
                    id={`restrict-${value}`}
                    name={`restrict-${value}`}
                    label={value}
                    checked={restrictEnum.values.includes(value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...restrictEnum.values, value]
                        : restrictEnum.values.filter((v) => v !== value);
                      onChange({
                        type: "restrictenum",
                        values: newValues,
                      } as FieldConstraint);
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400">No values available</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle number constraints
  if (constraint.type === "restrictnumber" && targetField.type === "number") {
    const restrictNumber = constraint as Extract<
      FieldConstraint,
      { type: "restrictnumber" }
    >;

    return (
      <div className="space-y-4">
        <div>
          <NumberInput
            id="constraint-min"
            name="constraint-min"
            label="Minimum Value"
            value={restrictNumber.min?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseFloat(e.target.value)
                : undefined;
              onChange({
                type: "restrictnumber",
                min: value,
                max: restrictNumber.max,
              } as FieldConstraint);
            }}
            placeholder="No minimum"
          />
        </div>
        <div>
          <NumberInput
            id="constraint-max"
            name="constraint-max"
            label="Maximum Value"
            value={restrictNumber.max?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseFloat(e.target.value)
                : undefined;
              onChange({
                type: "restrictnumber",
                min: restrictNumber.min,
                max: value,
              } as FieldConstraint);
            }}
            placeholder="No maximum"
          />
        </div>
      </div>
    );
  }

  // Handle string constraints
  if (constraint.type === "restrictstring" && targetField.type === "string") {
    const restrictString = constraint as Extract<
      FieldConstraint,
      { type: "restrictstring" }
    >;

    return (
      <div className="space-y-4">
        <div>
          <NumberInput
            id="constraint-min-length"
            name="constraint-min-length"
            label="Minimum Length"
            value={restrictString.minLength?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseInt(e.target.value, 10)
                : undefined;
              onChange({
                type: "restrictstring",
                minLength: value,
                maxLength: restrictString.maxLength,
                pattern: restrictString.pattern,
              } as FieldConstraint);
            }}
            placeholder="No minimum"
          />
        </div>
        <div>
          <NumberInput
            id="constraint-max-length"
            name="constraint-max-length"
            label="Maximum Length"
            value={restrictString.maxLength?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseInt(e.target.value, 10)
                : undefined;
              onChange({
                type: "restrictstring",
                minLength: restrictString.minLength,
                maxLength: value,
                pattern: restrictString.pattern,
              } as FieldConstraint);
            }}
            placeholder="No maximum"
          />
        </div>
        <div>
          <TextInput
            id="constraint-pattern"
            name="constraint-pattern"
            label="Regex Pattern"
            value={restrictString.pattern || ""}
            onChange={(e) => {
              onChange({
                type: "restrictstring",
                minLength: restrictString.minLength,
                maxLength: restrictString.maxLength,
                pattern: e.target.value || undefined,
              } as FieldConstraint);
            }}
            placeholder="e.g., ^[a-z]+$"
          />
        </div>
      </div>
    );
  }

  return null;
}
