import TextInput from "../../components/TextInput";
import Card from "../../components/Card";
import type { ServerConfig } from "../../bindings";

interface StaticConfigFormProps {
  config: ServerConfig;
  onChange: (key: keyof Omit<ServerConfig, "args">, value: any) => void;
}

export default function StaticConfigForm({
  config,
  onChange,
}: StaticConfigFormProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <TextInput
            id="steam-app-id"
            name="steamAppId"
            label="Steam App ID"
            type="number"
            value={String(config.steamAppId) || ""}
            onChange={(e) =>
              onChange("steamAppId", parseInt(e.target.value) || 0)
            }
            placeholder="e.g., 440"
          />
        </div>

        <div>
          <TextInput
            id="executable-name"
            name="executableName"
            label="Executable Name"
            value={config.executableName}
            onChange={(e) => onChange("executableName", e.target.value)}
            placeholder="e.g., srcds_linux"
          />
        </div>

        <div>
          <TextInput
            id="display-name"
            name="displayName"
            label="Display Name"
            value={config.displayName}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder="e.g., Team Fortress 2"
          />
        </div>
      </div>
    </Card>
  );
}
