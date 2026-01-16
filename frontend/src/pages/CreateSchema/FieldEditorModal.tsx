import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import SelectInput from "../../components/SelectInput";
import CheckboxInput from "../../components/CheckboxInput";
import Button from "../../components/Button";
import TypeSpecificConfig from "./TypeSpecificConfig";
import RuleList from "./RuleList";
import RuleEditor from "./RuleEditor";
import type { DynamicField, ConditionalRule } from "../../bindings";

interface FieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: DynamicField, rules?: ConditionalRule[]) => void;
  initialField?: DynamicField;
  allFields?: DynamicField[];
  existingRules?: ConditionalRule[];
}

const DEFAULT_FIELD: Extract<DynamicField, { type: "string" }> = {
  name: "",
  flag: "",
  useEquals: false,
  type: "string",
  default: null,
  required: false,
  description: "",
  displayName: null,
  pattern: null,
  minLength: null,
  maxLength: null,
};

export default function FieldEditorModal({
  isOpen,
  onClose,
  onSave,
  initialField,
  allFields = [],
  existingRules = [],
}: FieldEditorModalProps) {
  const [field, setField] = useState<DynamicField>(initialField || DEFAULT_FIELD);
  const [rules, setRules] = useState<ConditionalRule[]>(existingRules);
  const [activeTab, setActiveTab] = useState<"basic" | "rules">("basic");
  const [ruleEditorOpen, setRuleEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ConditionalRule | null>(null);

  useEffect(() => {
    if (isOpen) {
      setField(initialField || DEFAULT_FIELD);
      setRules(existingRules);
      setActiveTab("basic");
      setRuleEditorOpen(false);
      setEditingRule(null);
    }
  }, [isOpen, initialField, existingRules]);

  // Keep rules' targetFieldName in sync with field.name
  useEffect(() => {
    if (rules.length > 0) {
      setRules((prevRules) =>
        prevRules.map((rule) => ({
          ...rule,
          targetFieldName: field.name,
        }))
      );
    }
  }, [field.name]);

  const handleChange = (key: keyof DynamicField, value: any) => {
    setField((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTypeSpecificChange = (updatedField: DynamicField) => {
    setField(updatedField);
  };

  const handleSaveRule = (rule: ConditionalRule) => {
    // Ensure the rule has the correct targetFieldName
    const ruleWithCorrectTarget = {
      ...rule,
      targetFieldName: field.name,
    };

    if (editingRule) {
      // Update existing rule
      const existingIndex = rules.indexOf(editingRule);
      const newRules = [...rules];
      newRules[existingIndex] = ruleWithCorrectTarget;
      setRules(newRules);
    } else {
      // Add new rule
      setRules([...rules, ruleWithCorrectTarget]);
    }
    setRuleEditorOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleOpenRuleEditor = () => {
    setEditingRule(null);
    setRuleEditorOpen(true);
  };

  const handleEditRule = (rule: ConditionalRule) => {
    setEditingRule(rule);
    setRuleEditorOpen(true);
  };

  const handleSave = () => {
    if (!field.name || !field.description) {
      alert("Please fill in name and description");
      return;
    }
    
    // Ensure all rules have the correct targetFieldName
    const rulesWithTargetField = rules.map((rule) => ({
      ...rule,
      targetFieldName: field.name,
    }));
    
    onSave(field, rulesWithTargetField);
    setField(DEFAULT_FIELD);
    setRules([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {initialField ? "Edit Field" : "Create Field"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "basic"
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/50"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "rules"
                ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/50"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Conditional Restrictions
          </button>
        </div>

        <div className="p-6">
          {activeTab === "basic" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  id="field-name"
                  name="fieldName"
                  label="Name"
                  value={field.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., maxPlayers"
                />
                <TextInput
                  id="field-flag"
                  name="fieldFlag"
                  label="Flag (Optional)"
                  value={field.flag || ""}
                  onChange={(e) => handleChange("flag", e.target.value || undefined)}
                  placeholder="e.g., --max-players"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectInput
                  id="field-type"
                  name="fieldType"
                  label="Type"
                  value={field.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  options={[
                    { value: "string", label: "String" },
                    { value: "number", label: "Number" },
                    { value: "boolean", label: "Boolean" },
                    { value: "enum", label: "Enum" },
                    { value: "flag", label: "Flag" },
                  ]}
                />

                {/* Dynamic Default Value Field */}
                <div>
                  {field.type === "boolean" || field.type === "flag" ? (
                    <CheckboxInput
                      id="field-default-bool"
                      name="fieldDefaultBool"
                      label="Enabled by default"
                      checked={field.default === "true"}
                      onChange={(e) => handleChange("default", e.target.checked ? "true" : "")}
                    />
                  ) : field.type === "enum" ? (() => {
                    const enumField = field as Extract<DynamicField, { type: "enum" }>;
                    return (
                      <SelectInput
                        id="field-default-enum"
                        name="fieldDefaultEnum"
                        label="Default Value"
                        value={field.default || ""}
                        onChange={(e) => handleChange("default", e.target.value)}
                        options={[
                          { value: "", label: "None" },
                          ...(enumField.values && enumField.values.length > 0
                            ? enumField.values.map((val: string) => ({ value: val, label: val }))
                            : []),
                        ]}
                      />
                    );
                  })() : field.type === "number" ? (() => {
                    const numberField = field as Extract<DynamicField, { type: "number" }>;
                    return (
                      <NumberInput
                        id="field-default-number"
                        name="fieldDefaultNumber"
                        label="Default Value"
                        value={field.default || ""}
                        onChange={(e) => handleChange("default", e.target.value)}
                        min={numberField.min ?? undefined}
                        max={numberField.max ?? undefined}
                        placeholder="Optional"
                      />
                    );
                  })() : (
                    <TextInput
                      id="field-default"
                      name="fieldDefault"
                      label="Default Value"
                      value={field.default || ""}
                      onChange={(e) => handleChange("default", e.target.value)}
                      placeholder="Optional"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  id="field-description"
                  name="fieldDescription"
                  label="Description"
                  value={field.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="What does this argument do?"
                />
                <TextInput
                  id="field-display-name"
                  name="fieldDisplayName"
                  label="Display Name"
                  value={field.displayName || ""}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  placeholder="Optional UI name"
                />
              </div>

              <TypeSpecificConfig field={field} onChange={handleTypeSpecificChange} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CheckboxInput
                  id="field-use-equals"
                  name="fieldUseEquals"
                  label="Use equals (flag=value)"
                  checked={field.useEquals}
                  onChange={(e) => handleChange("useEquals", e.target.checked)}
                />
                <CheckboxInput
                  id="field-required"
                  name="fieldRequired"
                  label="Required"
                  checked={field.required}
                  onChange={(e) => handleChange("required", e.target.checked)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Rules for {field.displayName || field.name}
                </h3>
                <RuleList
                  rules={rules}
                  targetFieldName={field.name}
                  allFields={allFields}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  onAdd={handleOpenRuleEditor}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-700">
          <Button onClick={onClose} variant="secondary" maxWidth={false}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary" maxWidth={false}>
            Save Field
          </Button>
        </div>
      </div>

      {/* Rule Editor Modal */}
      <RuleEditor
        isOpen={ruleEditorOpen}
        onClose={() => {
          setRuleEditorOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        targetField={field}
        allFields={allFields}
        existingRule={editingRule ?? undefined}
      />
    </div>
  );
}
