import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import RuleConditionBuilder from "./RuleConditionBuilder";
import RuleConstraintBuilder from "./RuleConstraintBuilder";
import type { ConditionalRule, FieldConstraint, DynamicField } from "../../bindings";

interface RuleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: ConditionalRule) => void;
  targetField: DynamicField;
  allFields: DynamicField[];
  existingRule?: ConditionalRule;
}

const DEFAULT_RULE: ConditionalRule = {
  condition: { fieldName: "", operator: "equals", value: "" },
  targetFieldName: "",
  constraint: { type: "optional" } as FieldConstraint,
};

export default function RuleEditor({
  isOpen,
  onClose,
  onSave,
  targetField,
  allFields,
  existingRule,
}: RuleEditorProps) {
  const [rule, setRule] = useState<ConditionalRule>(
    existingRule || {
      ...DEFAULT_RULE,
      targetFieldName: targetField.name,
    }
  );

  // Available fields for condition (all except the target field)
  const availableFieldsForCondition = allFields.filter((f) => f.name !== targetField.name);

  // Initialize with existing rule when modal opens or existing rule changes
  useEffect(() => {
    if (existingRule) {
      setRule(existingRule);
    } else {
      setRule({
        ...DEFAULT_RULE,
        targetFieldName: targetField.name,
      });
    }
  }, [isOpen, existingRule, targetField.name]);

  // Auto-select first available field if none is selected and only one field is available
  useEffect(() => {
    if (!rule.condition.fieldName && availableFieldsForCondition.length > 0) {
      setRule((prev) => ({
        ...prev,
        condition: {
          ...prev.condition,
          fieldName: availableFieldsForCondition[0].name,
        },
      }));
    }
  }, [availableFieldsForCondition]);

  const handleSave = () => {
    if (!rule.condition.fieldName || !rule.condition.value) {
      alert("Please fill in all condition fields");
      return;
    }
    onSave(rule);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {existingRule ? "Edit Rule" : "Add Rule"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-slate-800 rounded border border-slate-600">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">For field:</span>{" "}
              {targetField.displayName || targetField.name}
            </p>
          </div>

          <RuleConditionBuilder
            condition={rule.condition}
            onChange={(condition) => setRule({ ...rule, condition })}
            availableFields={availableFieldsForCondition}
          />

          <RuleConstraintBuilder
            constraint={rule.constraint}
            onChange={(constraint) => setRule({ ...rule, constraint })}
            targetField={targetField}
          />
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-700">
          <Button onClick={onClose} variant="secondary" maxWidth={false}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" maxWidth={false}>
            Save Rule
          </Button>
        </div>
      </div>
    </div>
  );
}
