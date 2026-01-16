import { createContext, useContext, useState, type ReactNode } from "react";
import type { ServerConfig } from "../bindings";

interface SchemaEditorContextType {
  schema: ServerConfig | null;
  editingSchemaId: number | null;
  setSchema: (schema: ServerConfig) => void;
  setEditingSchemaId: (id: number | null) => void;
  clearSchema: () => void;
}

const SchemaEditorContext = createContext<SchemaEditorContextType | undefined>(
  undefined
);

export function SchemaEditorProvider({ children }: { children: ReactNode }) {
  const [schema, setSchema] = useState<ServerConfig | null>(null);
  const [editingSchemaId, setEditingSchemaId] = useState<number | null>(null);

  const clearSchema = () => {
    setSchema(null);
    setEditingSchemaId(null);
  };

  return (
    <SchemaEditorContext.Provider
      value={{
        schema,
        editingSchemaId,
        setSchema,
        setEditingSchemaId,
        clearSchema,
      }}
    >
      {children}
    </SchemaEditorContext.Provider>
  );
}

export function useSchemaEditor() {
  const context = useContext(SchemaEditorContext);
  if (context === undefined) {
    throw new Error("useSchemaEditor must be used within SchemaEditorProvider");
  }
  return context;
}
