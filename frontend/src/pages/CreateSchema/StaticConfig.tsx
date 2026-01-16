import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import type { ServerConfig } from "./types";

interface StaticConfigProps {
  config: Omit<ServerConfig, "args">;
  onChange: (key: keyof Omit<ServerConfig, "args">, value: any) => void;
}

export default function StaticConfig({ config, onChange }: StaticConfigProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-6">Server Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <TextInput
          id="display-name"
          name="displayName"
          label="Server Display Name"
          value={config.displayName}
          onChange={(e) => onChange("displayName", e.target.value)}
          placeholder="e.g., My Game Server"
        />
        <NumberInput
          id="steam-app-id"
          name="steamAppId"
          label="Steam App ID"
          value={config.steamAppId}
          onChange={(e) => onChange("steamAppId", e.target.value ? parseInt(e.target.value) : 0)}
          placeholder="e.g., 232290"
        />

        <TextInput
          id="executable-name"
          name="executableName"
          label="Executable Name"
          value={config.executableName}
          onChange={(e) => onChange("executableName", e.target.value)}
          placeholder="e.g., GameServer.exe"
        />
        <TextInput
          id="schema-version"
          name="schemaVersion"
          label="Schema Version"
          value={config.schemaVersion}
          onChange={(e) => onChange("schemaVersion", e.target.value)}
          placeholder="e.g., 1.0.0"
        />
      </div>
    </div>
  );
}
