export interface StringConfig {
  pattern?: string;
  maxLength?: number;
  minLength?: number;
}

export interface NumberConfig {
  min?: number;
  max?: number;
}

export interface EnumConfig {
  values: string[];
}

export type ArgumentType = "string" | "number" | "boolean" | "enum" | "flag";

export interface DynamicField {
  name: string;
  flag?: string;
  useEquals: boolean;
  type: ArgumentType;
  stringConfig?: StringConfig;
  numberConfig?: NumberConfig;
  enumConfig?: EnumConfig;
  default?: string;
  required: boolean;
  description: string;
  displayName?: string;
}

export interface ServerConfig {
  steamAppId: number;
  executableName: string;
  displayName: string;
  schemaVersion: string;
  args: DynamicField[];
}
