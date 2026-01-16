import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import type { ConditionalRule, DynamicField } from "../../bindings";

interface RuleListProps {
  rules: ConditionalRule[];
  targetFieldName: string;
  allFields: DynamicField[];
  onEdit: (rule: ConditionalRule) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

export default function RuleList({
  rules,
  targetFieldName,
  allFields,
  onEdit,
  onDelete,
  onAdd,
}: RuleListProps) {
  const fieldRules = rules.filter((r) => r.targetFieldName === targetFieldName);

  const getFieldDisplayName = (fieldName: string) => {
    return allFields.find((f) => f.name === fieldName)?.displayName || fieldName;
  };

  const getConstraintLabel = (constraint: ConditionalRule["constraint"]) => {
    switch (constraint.type) {
      case "restrictenum":
        return `Restrict to: ${constraint.values && constraint.values.length > 0 ? constraint.values.join(", ") : "(none)"}`;
      case "required":
        return "Make required";
      case "optional":
        return "Make optional";
      default:
        return "Unknown constraint";
    }
  };

  if (fieldRules.length === 0) {
    return (
      <div className="space-y-4 p-4 bg-slate-800 rounded border border-slate-700 text-center">
        <p className="text-gray-400">No conditional restrictions yet</p>
        <Button onClick={onAdd} variant="primary" maxWidth={false}>
          Add Rule
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fieldRules.map((rule, idx) => (
        <div key={idx} className="p-4 bg-slate-800 rounded border border-slate-700">
          <div className="mb-3">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">If</span> {getFieldDisplayName(rule.condition.fieldName)}{" "}
              <span className="text-blue-400">{rule.condition.operator}</span>{" "}
              <span className="font-mono text-yellow-400">{rule.condition.value}</span>
            </p>
            <p className="text-sm text-gray-300 mt-1">
              <span className="font-semibold">Then</span> {getConstraintLabel(rule.constraint)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(rule)}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(rules.indexOf(rule))}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ))}

      <Button onClick={onAdd} variant="secondary" maxWidth={true}>
        Add Another Rule
      </Button>
    </div>
  );
}
