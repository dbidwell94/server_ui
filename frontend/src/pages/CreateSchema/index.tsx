import { useState, useEffect } from "react";
import PageLayout from "../../components/PageLayout";
import AddFieldButton from "./AddFieldButton";
import FieldEditorModal from "./FieldEditorModal";
import FieldDisplay from "./FieldDisplay";
import StaticConfig from "./StaticConfig";
import CommandBuilderInput from "./CommandBuilderInput";
import Button from "../../components/Button";
import {
  ArrowDownTrayIcon,
  CheckIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import type {
  DynamicField,
  ServerConfig,
  ConditionalRule,
} from "../../bindings";
import { saveSchema, updateSchema } from "../../lib/gameSchemaApi";
import { useSchemaEditor } from "../../contexts/SchemaEditorContext";

const DEFAULT_CONFIG: Omit<ServerConfig, "args"> = {
  steamAppId: 0,
  executableName: "",
  displayName: "",
  schemaVersion: "1.0.0",
  rules: [],
  commandBuilder: null,
};

export default function CreateSchema() {
  const {
    schema: contextSchema,
    editingSchemaId,
    clearSchema,
  } = useSchemaEditor();
  const [config, setConfig] =
    useState<Omit<ServerConfig, "args">>(DEFAULT_CONFIG);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [_dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"fields" | "command">("fields");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentEditingSchemaId, setCurrentEditingSchemaId] = useState<
    number | null
  >(null);

  // Load schema from context if provided
  useEffect(() => {
    if (contextSchema.isSome()) {
      const schemaValue = contextSchema.value;
      setConfig({
        steamAppId: schemaValue.steamAppId,
        executableName: schemaValue.executableName,
        displayName: schemaValue.displayName,
        schemaVersion: schemaValue.schemaVersion,
        rules: schemaValue.rules,
        commandBuilder: schemaValue.commandBuilder,
      });
      setFields(schemaValue.args);
      if (editingSchemaId.isSome()) {
        setCurrentEditingSchemaId(editingSchemaId.value);
      }
      // Clear context after loading
      clearSchema();
    }
  }, [contextSchema, editingSchemaId, clearSchema]);

  const handleStaticChange = (
    key: keyof Omit<ServerConfig, "args">,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddField = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditField = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveField = (field: DynamicField, rules?: ConditionalRule[]) => {
    if (editingIndex !== null) {
      setFields((prev) => {
        const updated = [...prev];
        updated[editingIndex] = field;
        return updated;
      });
    } else {
      setFields((prev) => [...prev, field]);
    }

    // Update rules if provided
    if (rules) {
      setConfig((prev) => ({
        ...prev,
        rules: [
          ...prev.rules.filter((r) => r.targetFieldName !== field.name),
          ...rules,
        ],
      }));
    }

    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setFields((prev) => {
      const newFields = [...prev];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(dropIndex, 0, draggedField);
      return newFields;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleExportJSON = () => {
    const fullConfig: ServerConfig = {
      ...config,
      args: fields,
      commandBuilder: config.commandBuilder
        ? {
            structure: config.commandBuilder.structure[0]
              .split(/\s+/)
              .filter((part) => part.length > 0),
          }
        : null,
    };
    const dataStr = JSON.stringify(fullConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.displayName || "server"}-config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSchema = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      // Validate required fields
      if (!config.displayName.trim()) {
        throw new Error("Server Display Name is required");
      }
      if (!config.executableName.trim()) {
        throw new Error("Executable Name is required");
      }
      if (config.steamAppId <= 0) {
        throw new Error("Steam App ID must be greater than 0");
      }

      // Build the complete config
      const fullConfig: ServerConfig = {
        ...config,
        args: fields,
        commandBuilder: config.commandBuilder
          ? {
              structure: config.commandBuilder.structure[0]
                .split(/\s+/)
                .filter((part) => part.length > 0),
            }
          : null,
      };

      // Save to server (create or update)
      if (currentEditingSchemaId) {
        await updateSchema(currentEditingSchemaId, fullConfig);
        console.log(
          "Schema updated successfully with ID:",
          currentEditingSchemaId
        );
      } else {
        const result = await saveSchema(fullConfig);
        console.log("Schema saved successfully with ID:", result.id);
      }

      setSaveSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save schema";
      setSaveError(errorMessage);
      console.error("Error saving schema:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout showFooter>
      <div className="flex justify-center">
        <div className="max-w-7xl px-3 py-8 w-full space-y-8">
          <StaticConfig config={config} onChange={handleStaticChange} />

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab("fields")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "fields"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab("command")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "command"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Command Builder
            </button>
          </div>

          {/* Fields Tab */}
          {activeTab === "fields" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {fields.map((field, index) => (
                <FieldDisplay
                  key={field.displayName ?? field.name}
                  field={field}
                  onDelete={() => handleDeleteField(index)}
                  onEdit={() => handleEditField(index)}
                  isDragging={draggedIndex === index}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                />
              ))}

              {/* Add new field button */}
              <AddFieldButton onClick={handleAddField} />
            </div>
          )}

          {/* Command Builder Tab */}
          {activeTab === "command" && (
            <div className="space-y-4">
              <CommandBuilderInput
                value={config.commandBuilder?.structure.join(" ") || ""}
                onChange={(value) => {
                  setConfig((prev) => ({
                    ...prev,
                    commandBuilder:
                      value.length > 0 ? { structure: [value] } : null,
                  }));
                }}
                fields={fields}
                staticFields={[
                  { name: "executableName", label: "Executable Name" },
                  { name: "displayName", label: "Display Name" },
                  { name: "steamAppId", label: "Steam App ID" },
                  { name: "schemaVersion", label: "Schema Version" },
                ]}
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            {saveError && (
              <div className="text-red-400 text-sm py-2 px-4 bg-red-900/20 rounded-lg">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-green-400 text-sm py-2 px-4 bg-green-900/20 rounded-lg flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Schema saved successfully!
              </div>
            )}
            <Button
              onClick={handleExportJSON}
              variant="primary"
              maxWidth={false}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export Config
            </Button>
            <Button
              onClick={handleSaveSchema}
              variant="primary"
              maxWidth={false}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              {isSaving
                ? "Saving..."
                : currentEditingSchemaId
                  ? "Update Schema"
                  : "Save Schema"}
            </Button>
          </div>
        </div>
      </div>

      <FieldEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSave={handleSaveField}
        initialField={editingIndex !== null ? fields[editingIndex] : undefined}
        allFields={fields}
        existingRules={
          editingIndex !== null
            ? config.rules.filter(
                (r) => r.targetFieldName === fields[editingIndex].name
              )
            : []
        }
      />
    </PageLayout>
  );
}
