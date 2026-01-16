import Button from "../../components/Button";
import CheckboxInput from "../../components/CheckboxInput";
import type { DynamicField, FieldConstraint } from "../../bindings";

interface RuleConstraintBuilderProps {
  constraint: FieldConstraint;
  onChange: (constraint: FieldConstraint) => void;
  targetField: DynamicField | undefined;
}

export default function RuleConstraintBuilder({
  constraint,
  onChange,
  targetField,
}: RuleConstraintBuilderProps) {
  if (!targetField) {
    return (
      <div className="p-4 bg-slate-800 rounded border border-slate-700 text-gray-400">
        Select a field above to configure constraints
      </div>
    );
  }

  const isEnumField = targetField.type === "enum";
  const enumValues =
    isEnumField && targetField.type === "enum"
      ? (targetField as Extract<DynamicField, { type: "enum" }>).values || []
      : [];

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded border border-slate-700">
      <h3 className="text-sm font-semibold text-gray-300">Then</h3>

      {/* Constraint Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Constraint Type
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={constraint.type === "required" ? "primary" : "secondary"}
            onClick={() => onChange({ type: "required" } as FieldConstraint)}
            maxWidth={false}
          >
            Required
          </Button>
          <Button
            variant={constraint.type === "optional" ? "primary" : "secondary"}
            onClick={() => onChange({ type: "optional" } as FieldConstraint)}
            maxWidth={false}
          >
            Optional
          </Button>
          {isEnumField && (
            <Button
              variant={constraint.type === "restrictenum" ? "primary" : "secondary"}
              onClick={() =>
                onChange({
                  type: "restrictenum",
                  values: enumValues.slice(0, 1), // Pre-select first value
                } as FieldConstraint)
              }
              maxWidth={false}
            >
              Restrict Values
            </Button>
          )}
        </div>
      </div>

      {/* Constraint-specific configuration */}
      {constraint.type === "restrictenum" && isEnumField ? (() => {
        const restrictEnum = constraint as Extract<FieldConstraint, { type: "restrictenum" }>;
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Allowed Values
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {enumValues && enumValues.length > 0 ? (
                enumValues.map((value) => (
                  <CheckboxInput
                    key={value}
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
                ))
              ) : (
                <p className="text-gray-400">No values available</p>
              )}
            </div>
          </div>
        );
      })() : null}
    </div>
  );
}
