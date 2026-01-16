import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import type { SchemaMetadata, ServerConfig } from "../bindings";
import {
  getAllSchemas,
  deleteSchema,
  getSchemaById,
  validateSchema,
} from "../lib/gameSchemaApi";
import { useSchemaEditor } from "../contexts/SchemaEditorContext";

export default function Schemas() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSchema, setEditingSchemaId, clearSchema } = useSchemaEditor();
  const [schemas, setSchemas] = useState<SchemaMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchemas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllSchemas();
        console.log(data);
        setSchemas(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load schemas";
        setError(errorMessage);
        console.error("Error loading schemas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchemas();
  }, []);

  const handleEdit = async (schemaId: number) => {
    try {
      // Load the full schema
      const schema = await getSchemaById(schemaId);
      // Store in context
      setSchema(schema);
      setEditingSchemaId(schemaId);
      // Navigate to editor
      navigate("/create-schema");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load schema";
      setError(errorMessage);
      console.error("Error loading schema:", err);
    }
  };

  const handleDelete = async (schemaId: number, schemaName: string) => {
    if (!confirm(`Are you sure you want to delete "${schemaName}"?`)) {
      return;
    }

    setIsDeleting(schemaId);
    setDeleteError(null);

    try {
      await deleteSchema(schemaId);
      setSchemas((prev) => prev.filter((s) => s.id !== schemaId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete schema";
      setDeleteError(errorMessage);
      console.error("Error deleting schema:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreateNew = () => {
    // Clear any editing session
    clearSchema();
    navigate("/create-schema");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const text = await file.text();
      const schema: ServerConfig = JSON.parse(text);

      // Validate the schema has required fields
      if (!schema.steamAppId || !schema.executableName || !schema.displayName) {
        throw new Error(
          "Invalid schema: missing required fields (steamAppId, executableName, displayName)"
        );
      }

      // Validate with server
      await validateSchema(schema);

      // Store in context (without editing ID for new schema)
      setSchema(schema);
      setEditingSchemaId(null);

      // Navigate to editor
      navigate("/create-schema");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to import schema";
      setImportError(errorMessage);
      console.error("Error importing schema:", err);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <PageLayout showFooter>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      <div className="flex justify-center">
        <div className="max-w-4xl px-3 py-8 w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Server Schemas</h1>
            <div className="flex gap-3">
              <Button
                onClick={handleImportClick}
                variant="primary"
                maxWidth={false}
                className="flex items-center gap-2"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import Schema
              </Button>
              <Button
                onClick={handleCreateNew}
                variant="primary"
                maxWidth={false}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                New Schema
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {importError && (
            <div className="text-red-400 text-sm py-3 px-4 bg-red-900/20 rounded-lg mb-6">
              {importError}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm py-3 px-4 bg-red-900/20 rounded-lg mb-6">
              {error}
            </div>
          )}

          {deleteError && (
            <div className="text-red-400 text-sm py-3 px-4 bg-red-900/20 rounded-lg mb-6">
              {deleteError}
            </div>
          )}

          {schemas.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-6">No schemas created yet</p>
              <Button
                onClick={handleCreateNew}
                variant="primary"
                maxWidth={false}
                className="flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                Create First Schema
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schemas.map((schema) => (
                <div
                  key={schema.id}
                  className="bg-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700 transition"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {schema.name}
                    </h3>
                    <div className="flex gap-6 mt-2 text-sm text-gray-400">
                      <span>Steam App ID: {schema.steamAppId}</span>
                      <span>Version: {schema.schemaVersion}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleEdit(schema.id)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition"
                      title="Edit schema"
                      disabled={isDeleting === schema.id}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(schema.id, schema.name)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition"
                      title="Delete schema"
                      disabled={isDeleting === schema.id}
                    >
                      {isDeleting === schema.id ? (
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
