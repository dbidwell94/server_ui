import { createContext, useContext, useState, type ReactNode } from "react";
import { option, type Option } from "@dbidwell94/ts-utils";
import type { ServerConfig } from "../bindings";

interface SchemaEditorContextType {
  schema: Option<ServerConfig>;
  editingSchemaId: Option<number>;
  setSchema: (schema: ServerConfig) => void;
  setEditingSchemaId: (id: number) => void;
  clearSchema: () => void;
}

const SchemaEditorContext = createContext<SchemaEditorContextType | undefined>(
  undefined
);

export function SchemaEditorProvider({ children }: { children: ReactNode }) {
  const [schema, setSchema] = useState<Option<ServerConfig>>(option.none());
  const [editingSchemaId, setEditingSchemaId] = useState<Option<number>>(
    option.none()
  );

  const handleSetSchema = (newSchema: ServerConfig) => {
    setSchema(option.some(newSchema));
  };

  const handleSetEditingSchemaId = (id: number) => {
    setEditingSchemaId(option.some(id));
  };

  const clearSchema = () => {
    setSchema(option.none());
    setEditingSchemaId(option.none());
  };

  return (
    <SchemaEditorContext.Provider
      value={{
        schema,
        editingSchemaId,
        setSchema: handleSetSchema,
        setEditingSchemaId: handleSetEditingSchemaId,
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
