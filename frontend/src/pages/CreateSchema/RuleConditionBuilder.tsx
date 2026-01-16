import SelectInput from "../../components/SelectInput";
import TextInput from "../../components/TextInput";
import type { Condition, ConditionOperator, DynamicField } from "../../bindings";

interface RuleConditionBuilderProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  availableFields: DynamicField[];
}

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "notequals", label: "Not Equals" },
  { value: "lessthan", label: "Less Than" },
  { value: "greaterthan", label: "Greater Than" },
  { value: "lessthanorequal", label: "Less Than or Equal" },
  { value: "greaterthanorequal", label: "Greater Than or Equal" },
  { value: "contains", label: "Contains" },
  { value: "matches", label: "Matches (Regex)" },
  { value: "in", label: "In List" },
];

export default function RuleConditionBuilder({
  condition,
  onChange,
  availableFields,
}: RuleConditionBuilderProps) {
  const selectedField = availableFields.find((f) => f.name === condition.fieldName);
  const isEnumField = selectedField && selectedField.type === "enum";
  const enumValues =
    isEnumField && selectedField && selectedField.type === "enum"
      ? (selectedField as Extract<DynamicField, { type: "enum" }>).values || []
      : [];

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded border border-slate-700">
      <h3 className="text-sm font-semibold text-gray-300">When</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          id="condition-field"
          name="conditionField"
          label="Field"
          value={condition.fieldName}
          onChange={(e) => onChange({ ...condition, fieldName: e.target.value })}
          options={availableFields.map((f) => ({ value: f.name, label: f.displayName || f.name }))}
        />

        <SelectInput
          id="condition-operator"
          name="conditionOperator"
          label="Operator"
          value={condition.operator}
          onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}
          options={OPERATORS}
        />

        {/* Value input - dropdown for enum, text for others */}
        {isEnumField && enumValues && enumValues.length > 0 ? (
          <SelectInput
            id="condition-value"
            name="conditionValue"
            label="Value"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            options={[
              { value: "", label: "Select a value" },
              ...enumValues.map((v) => ({ value: v, label: v })),
            ]}
          />
        ) : (
          <TextInput
            id="condition-value"
            name="conditionValue"
            label="Value"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Enter value to compare"
          />
        )}
      </div>
    </div>
  );
}
