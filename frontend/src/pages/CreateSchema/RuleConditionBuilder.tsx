import SelectInput from "../../components/SelectInput";
import TextInput from "../../components/TextInput";
import type {
  Condition,
  ConditionOperator,
  DynamicField,
} from "../../bindings";
import CheckboxInput from "../../components/CheckboxInput";
import NumberInput from "../../components/NumberInput";

interface RuleConditionBuilderProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  availableFields: DynamicField[];
}

const OPERATORS: { value: ConditionOperator; displayName: string }[] = [
  { value: "equals", displayName: "Equals" },
  { value: "notequals", displayName: "Not Equals" },
  { value: "lessthan", displayName: "Less Than" },
  { value: "greaterthan", displayName: "Greater Than" },
  { value: "lessthanorequal", displayName: "Less Than or Equal" },
  { value: "greaterthanorequal", displayName: "Greater Than or Equal" },
  { value: "contains", displayName: "Contains" },
  { value: "matches", displayName: "Matches (Regex)" },
  { value: "in", displayName: "In List" },
];

export default function RuleConditionBuilder({
  condition,
  onChange,
  availableFields,
}: RuleConditionBuilderProps) {
  const selectedField =
    availableFields.find((f) => f.name === condition.fieldName) ??
    availableFields[0];

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded border border-slate-700">
      <h3 className="text-sm font-semibold text-gray-300">When</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          id="condition-field"
          name="conditionField"
          label="Field"
          value={condition.fieldName}
          onChange={(e) =>
            onChange({ ...condition, fieldName: e.target.value })
          }
          options={availableFields.map((f) => {
            const displayName = f.displayName || undefined;
            return {
              value: f.name,
              displayName,
            };
          })}
        />

        <SelectInput
          id="condition-operator"
          name="conditionOperator"
          label="Operator"
          value={condition.operator}
          onChange={(e) =>
            onChange({
              ...condition,
              operator: e.target.value as ConditionOperator,
            })
          }
          options={OPERATORS}
        />

        {getDynamicFieldByType(selectedField, condition, onChange)}
      </div>
    </div>
  );
}

function getDynamicFieldByType(
  field: DynamicField,
  condition: Condition,
  onChange: (condition: Condition) => void
) {
  // Special handling for "In List" operator
  if (condition.operator === "in") {
    if (field.type === "enum") {
      // For enums, show checkboxes for multiple selection
      const selectedValues = Array.isArray(condition.value)
        ? condition.value
        : (condition.value as string)
          ? (condition.value as string).split(",").map((v: string) => v.trim())
          : [];

      return (
        <div className="md:col-span-1 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Select Values
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-700 p-2 rounded border border-slate-600">
            {field.values && field.values.length > 0 ? (
              field.values.map((value) => (
                <CheckboxInput
                  key={value}
                  id={`in-list-${value}`}
                  name={`inList-${value}`}
                  label={field.displayNames?.[value] || value}
                  checked={selectedValues.includes(value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, value]
                      : selectedValues.filter((v) => v !== value);
                    onChange({
                      ...condition,
                      value: newValues,
                    });
                  }}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm">No values available</p>
            )}
          </div>
        </div>
      );
    } else {
      // For non-enum types, show a textarea for comma-separated values
      const textValue = Array.isArray(condition.value)
        ? condition.value.join(", ")
        : (condition.value as string) || "";

      return (
        <TextInput
          id="condition-value"
          name="conditionValue"
          label="Values (comma-separated)"
          value={textValue}
          onChange={(e) => {
            const values = e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
            onChange({ ...condition, value: values });
          }}
          placeholder="e.g., value1, value2, value3"
          textarea
          rows={3}
        />
      );
    }
  }

  switch (field.type) {
    case "enum": {
      const stringValue = Array.isArray(condition.value)
        ? ""
        : (condition.value as string) || "";
      return (
        <SelectInput
          id="condition-value"
          label="Value"
          name="conditionValue"
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          value={stringValue}
          options={[
            ...(field.values
              ? field.values.map((v) => ({
                  value: v,
                  displayName: field.displayNames?.[v],
                }))
              : [{ value: "", displayName: "No values available" }]),
          ]}
        />
      );
    }
    case "flag":
    case "boolean": {
      const stringValue = Array.isArray(condition.value)
        ? "false"
        : (condition.value as string) || "false";
      return (
        <CheckboxInput
          id="condition-value"
          label="Value"
          name="conditionValue"
          checked={stringValue === "true"}
          onChange={(e) =>
            onChange({
              ...condition,
              value: e.target.checked ? "true" : "false",
            })
          }
        />
      );
    }
    case "number": {
      const stringValue = Array.isArray(condition.value)
        ? ""
        : (condition.value as string) || "";
      return (
        <NumberInput
          id="condition-value"
          label="Value"
          name="conditionValue"
          min={field.min}
          max={field.max}
          value={stringValue}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        />
      );
    }
    default: {
      const stringValue = Array.isArray(condition.value)
        ? ""
        : (condition.value as string) || "";
      return (
        <TextInput
          id="condition-value"
          label="Value"
          name="conditionValue"
          value={stringValue}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        />
      );
    }
  }
}
