import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/Card";
import SelectInput from "../components/SelectInput";
import TextInput from "../components/TextInput";
import NumberInput from "../components/NumberInput";
import CheckboxInput from "../components/CheckboxInput";
import ErrorMessage from "../components/ErrorMessage";
import type {
  SchemaMetadata,
  ServerConfig,
  DynamicField,
  ConditionalRule,
  FieldConstraint,
  Condition,
  GameConfig,
} from "../bindings";
import {
  getAllSchemas,
  getSchemaById,
  validateGameConfig,
} from "../lib/gameSchemaApi";
import { option, result } from "@dbidwell94/ts-utils";

// Helper function to evaluate a condition against form values
function evaluateCondition(
  condition: Condition,
  formValues: Record<string, any>,
  allFields: DynamicField[],
): boolean {
  const fieldValue = formValues[condition.fieldName];
  const field = allFields.find((f) => f.name === condition.fieldName);

  if (!field) return false;

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;
    case "notequals":
      return fieldValue !== condition.value;
    case "lessthan":
      return Number(fieldValue) < Number(condition.value);
    case "greaterthan":
      return Number(fieldValue) > Number(condition.value);
    case "lessthanorequal":
      return Number(fieldValue) <= Number(condition.value);
    case "greaterthanorequal":
      return Number(fieldValue) >= Number(condition.value);
    case "contains":
      return String(fieldValue).includes(String(condition.value));
    case "matches":
      try {
        const regex = new RegExp(condition.value as string);
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }
    case "in":
      const values = Array.isArray(condition.value)
        ? condition.value
        : String(condition.value)
            .split(",")
            .map((v) => v.trim());
      return values.includes(String(fieldValue));
    default:
      return false;
  }
}

// Get all applicable constraints for a field based on current form state
function getApplicableConstraints(
  fieldName: string,
  formValues: Record<string, any>,
  rules: ConditionalRule[],
  allFields: DynamicField[],
): FieldConstraint[] {
  const constraints: FieldConstraint[] = [];

  rules.forEach((rule) => {
    if (rule.targetFieldName === fieldName) {
      const conditionMet = evaluateCondition(
        rule.condition,
        formValues,
        allFields,
      );
      if (conditionMet) {
        constraints.push(rule.constraint);
      }
    }
  });

  return constraints;
}

export default function RunGame() {
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState<SchemaMetadata[]>([]);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(true);
  const [schemasError, setSchemasError] = useState<string | null>(null);

  const [selectedSchemaId, setSelectedSchemaId] = useState<number | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<ServerConfig | null>(
    null,
  );
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<GameConfig["config"]>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load all schemas on mount
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        setIsLoadingSchemas(true);
        setSchemasError(null);
        const data = await getAllSchemas();
        setSchemas(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load schemas";
        setSchemasError(errorMessage);
        console.error("Error loading schemas:", err);
      } finally {
        setIsLoadingSchemas(false);
      }
    };

    loadSchemas();
  }, []);

  // Load selected schema
  const handleSchemaSelect = async (schemaId: number) => {
    setSelectedSchemaId(schemaId);
    setSelectedSchema(null);
    setFormValues({});
    setSchemaError(null);
    setIsLoadingSchema(true);

    const res = await result.fromPromise(getSchemaById(schemaId));

    if (res.isOk()) {
      const schema = res.value;
      const initialValues: Record<string, any> = {};
      schema.args.forEach((field) => {
        initialValues[field.name] = field.default || "";
      });
      setFormValues(initialValues);
      setSelectedSchema(res.value);
    } else {
      setSchemaError(res.error.message);
    }
    setIsLoadingSchema(false);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const validationResult = await result.fromPromise(
      option
        .unknown(selectedSchemaId)
        .okOr("No schema selected")
        .mapOk((schemaId) => validateGameConfig(schemaId, formValues)),
    );

    if (validationResult.isError()) {
      setSubmitError(validationResult.error.message);
    } else {
      console.log("Validation succeeded");
      // TODO: Proceed with server creation once API is available
      navigate("/");
    }
    setIsSubmitting(false);
  };

  const renderField = (field: DynamicField) => {
    if (!selectedSchema) return null;

    const value = formValues[field.name] ?? field.default ?? "";
    const label = field.displayName || field.name;
    const constraints = getApplicableConstraints(
      field.name,
      formValues,
      selectedSchema.rules,
      selectedSchema.args,
    );

    // Check for restrictenum constraint
    let restrictedValues: string[] | undefined;
    constraints.forEach((constraint) => {
      if (constraint.type === "restrictenum") {
        restrictedValues = (constraint as any).values;
      }
    });

    switch (field.type) {
      case "string":
        return (
          <TextInput
            key={field.name}
            id={field.name}
            name={field.name}
            label={label}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.description || ""}
            required={field.required}
          />
        );

      case "number": {
        const numberField = field as Extract<DynamicField, { type: "number" }>;
        return (
          <NumberInput
            key={field.name}
            id={field.name}
            name={field.name}
            label={label}
            value={value}
            onChange={(e) => {
              const numValue = e.target.value ? parseFloat(e.target.value) : "";
              handleInputChange(field.name, numValue);
            }}
            min={numberField.min ?? undefined}
            max={numberField.max ?? undefined}
            placeholder={field.description || ""}
            required={field.required}
          />
        );
      }

      case "boolean":
        return (
          <CheckboxInput
            key={field.name}
            id={field.name}
            name={field.name}
            label={label}
            checked={value === "true" || value === true}
            onChange={(e) =>
              handleInputChange(field.name, e.target.checked ? "true" : "false")
            }
          />
        );

      case "enum": {
        const enumField = field as Extract<DynamicField, { type: "enum" }>;

        // Filter options based on restrictenum constraint
        let availableValues = enumField.values || [];
        if (restrictedValues) {
          availableValues = availableValues.filter((v) =>
            restrictedValues!.includes(v),
          );
        }

        return (
          <SelectInput
            key={field.name}
            id={field.name}
            name={field.name}
            label={label}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            options={[
              { value: "", displayName: "Select an option" },
              ...(availableValues.length > 0
                ? availableValues.map((v: string) => ({
                    value: v,
                    displayName: enumField.displayNames?.[v] || v,
                  }))
                : []),
            ]}
            required={field.required}
          />
        );
      }

      case "flag":
        return (
          <CheckboxInput
            key={field.name}
            id={field.name}
            name={field.name}
            label={label}
            checked={value === "true" || value === true}
            onChange={(e) =>
              handleInputChange(field.name, e.target.checked ? "true" : "false")
            }
          />
        );

      default:
        return null;
    }
  };

  if (isLoadingSchemas) {
    return (
      <PageLayout showFooter>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      <div className="flex justify-center">
        <div className="max-w-7xl w-full px-3 py-8 space-y-8">
          <h1 className="text-4xl font-bold text-white">Run Game Server</h1>

          {schemasError && <ErrorMessage message={schemasError} />}

          {/* Schema Selection */}
          <Card fullWidth>
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <SelectInput
                  id="schema-select"
                  name="schemaSelect"
                  label="Game Schema"
                  value={selectedSchemaId?.toString() || ""}
                  onChange={(e) => {
                    const schemaId = parseInt(e.target.value, 10);
                    if (!isNaN(schemaId)) {
                      handleSchemaSelect(schemaId);
                    }
                  }}
                  options={[
                    { value: "", displayName: "Choose a schema..." },
                    ...schemas.map((schema) => ({
                      value: schema.id.toString(),
                      displayName: schema.name,
                    })),
                  ]}
                />
              </div>

              {/* Schema Details */}
              {selectedSchema && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-600">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Display Name
                    </p>
                    <p className="text-sm text-white font-medium">
                      {selectedSchema.displayName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Executable
                    </p>
                    <p className="text-sm text-white font-medium truncate">
                      {selectedSchema.executableName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Steam App ID
                    </p>
                    <p className="text-sm text-white font-medium">
                      {selectedSchema.steamAppId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Version
                    </p>
                    <p className="text-sm text-white font-medium">
                      {selectedSchema.schemaVersion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Configuration Fields Grid */}
          {schemaError && <ErrorMessage message={schemaError} />}

          {isLoadingSchema && <LoadingSpinner />}

          {selectedSchema && !isLoadingSchema && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {submitError && <ErrorMessage message={submitError} />}

              {selectedSchema.args.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedSchema.args.map((field) => (
                      <Card key={field.name}>{renderField(field)}</Card>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      maxWidth={false}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Server"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">
                  This schema has no configurable arguments.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
