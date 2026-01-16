import apiClient from "./api";
import type { ServerConfig, SchemaMetadata } from "../bindings";

/**
 * Saves a server schema configuration to the server.
 * @param schema - The complete ServerConfig to save
 * @returns Promise resolving to the schema metadata including the assigned ID
 */
export async function saveSchema(
  schema: ServerConfig
): Promise<SchemaMetadata> {
  const response = await apiClient.post<SchemaMetadata>(
    "/game_schema/create",
    schema
  );
  return response.data;
}

/**
 * Retrieves a schema by ID.
 * @param id - The schema ID
 * @returns Promise resolving to the ServerConfig
 */
export async function getSchemaById(id: number): Promise<ServerConfig> {
  const response = await apiClient.get<ServerConfig>(`/game_schema/json/${id}`);
  return response.data;
}

/**
 * Retrieves schema metadata by ID.
 * @param id - The schema ID
 * @returns Promise resolving to the SchemaMetadata
 */
export async function getSchemaMetadataById(
  id: number
): Promise<SchemaMetadata> {
  const response = await apiClient.get<SchemaMetadata>(
    `/game_schema/metadata/${id}`
  );
  return response.data;
}

/**
 * Retrieves all available schemas.
 * @returns Promise resolving to an array of SchemaMetadata
 */
export async function getAllSchemas(): Promise<SchemaMetadata[]> {
  const response = await apiClient.get<SchemaMetadata[]>("/game_schema/list");
  return response.data;
}

/**
 * Searches for schemas by name.
 * @param nameFilter - Partial name to search for
 * @returns Promise resolving to an array of matching SchemaMetadata
 */
export async function searchSchemasByName(
  nameFilter: string
): Promise<SchemaMetadata[]> {
  const response = await apiClient.get<SchemaMetadata[]>(
    `/game_schema/search`,
    { params: { name: nameFilter } }
  );
  return response.data;
}

/**
 * Updates an existing schema configuration.
 * @param id - The schema ID
 * @param schema - The updated ServerConfig
 * @returns Promise that resolves when update is complete
 */
export async function updateSchema(
  id: number,
  schema: ServerConfig
): Promise<void> {
  await apiClient.put(`/game_schema/update/${id}`, schema);
}

/**
 * Validates a schema configuration.
 * @param schema - The ServerConfig to validate
 * @returns Promise that resolves if validation succeeds
 */
export async function validateSchema(schema: ServerConfig): Promise<void> {
  await apiClient.post("/game_schema/validate", schema);
}

/**
 * Deletes a schema by ID.
 * @param id - The schema ID
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteSchema(id: number): Promise<void> {
  await apiClient.delete(`/game_schema/${id}`);
}
