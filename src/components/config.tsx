import type { SelectOption, TabSelectOption } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { type Config, type Model } from "../lib/config";
import { BUILTIN_PROVIDERS, type ModelEntry } from "../lib/provider";
import { useAppStore } from "../store/app-store";

const PROVIDER_OPTIONS: SelectOption[] = Object.values(BUILTIN_PROVIDERS).map((p) => ({
  name: p.name,
  description: "",
}));
const PROVIDER_IDS = Object.keys(BUILTIN_PROVIDERS);

const CONVENTIONAL_OPTIONS: TabSelectOption[] = [
  { name: "On", description: "" },
  { name: "Off", description: "" },
];

const HOME_FIELD_COUNT = 2; // conventional toggle, provider tab-select

export function ConfigScreen() {
  const config = useAppStore((s) => s.config);
  const saveConfig = useAppStore((s) => s.saveConfig);

  const conventional = config ? config.conventional : true;
  const models = config ? config.models : [];

  const [providerId, setProviderId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(0);

  useKeyboard((key) => {
    if (key.name !== "tab") return;
    if (providerId) return; // detail view handles its own tabbing
    setFocusIndex((i) => {
      if (key.shift) return i === null ? HOME_FIELD_COUNT - 1 : i === 0 ? null : i - 1;
      return i === null ? 0 : i === HOME_FIELD_COUNT - 1 ? null : i + 1;
    });
  });

  const persist = (patch: Partial<Config>) => {
    saveConfig({ conventional, models, ...patch });
  };

  if (providerId) {
    return (
      <ProviderDetail
        providerId={providerId}
        existing={models.find((m) => m.provider === providerId) ?? null}
        onBack={() => setProviderId(null)}
        onSave={(model) => {
          const rest = models.filter((m) => m.provider !== providerId);
          persist({ models: [...rest, model] });
          setProviderId(null);
        }}
      />
    );
  }

  return (
    <box flexDirection="column" padding={1} flexGrow={1}>
      <text attributes={1}>Tab to navigate, Enter to select</text>

      <box marginTop={1}>
        <text>Select Provider:</text>
      </box>
      <select
        options={PROVIDER_OPTIONS}
        height={6}
        focused={focusIndex === 0}
        focusedBackgroundColor="#333333"
        onSelect={(index) => setProviderId(PROVIDER_IDS[index] ?? null)}
      />

      <box marginTop={1}>
        <text>Conventional Commit:</text>
      </box>
      <tab-select
        options={CONVENTIONAL_OPTIONS}
        focused={focusIndex === 1}
        focusedBackgroundColor="#333333"
        onSelect={(index) => persist({ conventional: index === 0 })}
      />
    </box>
  );
}

function ProviderDetail({
  providerId,
  existing,
  onBack,
  onSave,
}: {
  providerId: string;
  existing: Model | null;
  onBack: () => void;
  onSave: (model: Model) => void;
}) {
  const provider = BUILTIN_PROVIDERS[providerId]!;
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? "");
  const [baseURL, setBaseURL] = useState(existing?.baseURL ?? provider.defaultBaseURL ?? "");
  const [modelEntries, setModelEntries] = useState<ModelEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const fieldCount = (provider.needsApiKey === false ? 0 : 1) + (provider.needsBaseURL ? 1 : 0) + 1;

  useKeyboard((key) => {
    if (key.name === "escape") {
      onBack();
      return;
    }
    if (key.name === "tab") {
      setFocusIndex((i) => {
        if (key.shift) return (i - 1 + fieldCount) % fieldCount;
        return (i + 1) % fieldCount;
      });
    }
  });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    provider
      .listModels(apiKey, baseURL || undefined)
      .then((entries) => {
        if (!cancelled) setModelEntries(entries);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, baseURL]);

  const modelOptions: SelectOption[] = modelEntries.map((m) => ({ name: m.id, description: "" }));

  let field = 0;
  const apiKeyIndex = provider.needsApiKey === false ? -1 : field++;
  const baseURLIndex = provider.needsBaseURL ? field++ : -1;
  const modelIndex = field++;

  return (
    <box flexDirection="column" padding={1} flexGrow={1}>
      <text attributes={1}>{provider.name} — Tab to navigate, Esc to go back</text>

      {apiKeyIndex >= 0 && (
        <box flexDirection="column" marginTop={1}>
          <text>API Key</text>
          <input
            value={apiKey}
            placeholder="API key"
            focused={focusIndex === apiKeyIndex}
            focusedBackgroundColor="#333333"
            onChange={setApiKey}
          />
        </box>
      )}

      {baseURLIndex >= 0 && (
        <box flexDirection="column" marginTop={1}>
          <text>Base URL</text>
          <input
            value={baseURL}
            placeholder={provider.defaultBaseURL ?? "Base URL"}
            focused={focusIndex === baseURLIndex}
            focusedBackgroundColor="#333333"
            onChange={setBaseURL}
          />
        </box>
      )}

      <box flexDirection="column" marginTop={1} flexGrow={1}>
        <text>Model{error ? ` (${error})` : ""}</text>
        <select
          options={modelOptions}
          height={6}
          focused={focusIndex === modelIndex}
          focusedBackgroundColor="#333333"
          onSelect={(_, option) => {
            if (!option) return;
            onSave({ name: provider.name, provider: providerId as Model["provider"], model: option.name, apiKey, baseURL: baseURL || undefined });
          }}
        />
      </box>
    </box>
  );
}
