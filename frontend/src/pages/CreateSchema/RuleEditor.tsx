import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import RuleConditionBuilder from "./RuleConditionBuilder";
import RuleConstraintBuilder from "./RuleConstraintBuilder";
import type {
  ConditionalRule,
  FieldConstraint,
  DynamicField,
} from "../../bindings";

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
  // Available fields for condition (all except the target field)
  const availableFieldsForCondition = allFields.filter(
    (f) => f.name !== targetField.name
  );

  const getInitialRule = (): ConditionalRule => {
    if (existingRule) {
      return existingRule;
    }
    const firstAvailableField = availableFieldsForCondition[0];
    return {
      ...DEFAULT_RULE,
      targetFieldName: targetField.name,
      condition: {
        ...DEFAULT_RULE.condition,
        fieldName: firstAvailableField?.name ?? "",
      },
    };
  };

  const [rule, setRule] = useState<ConditionalRule>(getInitialRule());

  // Initialize with existing rule when modal opens or existing rule changes
  useEffect(() => {
    setRule(getInitialRule());
  }, [isOpen, existingRule, targetField.name, availableFieldsForCondition]);

  // When field changes, set a default value based on field type
  useEffect(() => {
    if (!existingRule && rule.condition.fieldName && !rule.condition.value) {
      const selectedField = availableFieldsForCondition.find(
        (f) => f.name === rule.condition.fieldName
      );

      if (selectedField) {
        let defaultValue = "";

        if (
          selectedField.type === "enum" &&
          selectedField.values &&
          selectedField.values.length > 0
        ) {
          // For enums, select the first value
          defaultValue = selectedField.values[0];
        } else if (
          selectedField.type === "boolean" ||
          selectedField.type === "flag"
        ) {
          // For boolean/flag, default to "false"
          defaultValue = "false";
        } else if (selectedField.type === "number") {
          // For numbers, default to "0"
          defaultValue = "0";
        } else {
          // For strings and others, leave empty (user must fill)
          defaultValue = "";
        }

        setRule((prev) => ({
          ...prev,
          condition: {
            ...prev.condition,
            value: defaultValue,
          },
        }));
      }
    }
  }, [rule.condition.fieldName, availableFieldsForCondition, existingRule]);

  const handleSave = () => {
    // Get the selected field to check its type
    const selectedField = availableFieldsForCondition.find(
      (f) => f.name === rule.condition.fieldName
    );

    // For boolean/flag types, value is automatically set, so validation passes
    if (
      selectedField &&
      (selectedField.type === "boolean" || selectedField.type === "flag")
    ) {
      // These types always have a value set automatically
    } else {
      // For other types, value is required
      const isEmpty = Array.isArray(rule.condition.value)
        ? rule.condition.value.length === 0
        : !(rule.condition.value as string) ||
          (rule.condition.value as string).trim() === "";
      if (isEmpty) {
        alert("Please fill in all condition fields");
        return;
      }
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
