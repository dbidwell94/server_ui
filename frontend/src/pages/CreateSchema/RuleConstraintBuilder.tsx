import Button from "../../components/Button";
import type { DynamicField, FieldConstraint } from "../../bindings";
import ConstraintConfig from "./ConstraintConfig";

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
  const isNumberField = targetField.type === "number";
  const isStringField = targetField.type === "string";

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
              variant={
                constraint.type === "restrictenum" ? "primary" : "secondary"
              }
              onClick={() =>
                onChange({
                  type: "restrictenum",
                  values: targetField.values?.slice(0, 1) || [],
                } as FieldConstraint)
              }
              maxWidth={false}
            >
              Restrict Values
            </Button>
          )}
          {isNumberField && (
            <Button
              variant={
                constraint.type === "restrictnumber" ? "primary" : "secondary"
              }
              onClick={() =>
                onChange({
                  type: "restrictnumber",
                } as FieldConstraint)
              }
              maxWidth={false}
            >
              Restrict Range
            </Button>
          )}
          {isStringField && (
            <Button
              variant={
                constraint.type === "restrictstring" ? "primary" : "secondary"
              }
              onClick={() =>
                onChange({
                  type: "restrictstring",
                } as FieldConstraint)
              }
              maxWidth={false}
            >
              Restrict Pattern
            </Button>
          )}
        </div>
      </div>

      {/* Constraint-specific configuration */}
      <ConstraintConfig
        constraint={constraint}
        onChange={onChange}
        targetField={targetField}
      />
    </div>
  );
}
