import type { SelectOption, TabSelectOption } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import type { Model } from "../../lib/config";
import { BUILTIN_PROVIDERS, type ModelEntry } from "../../lib/provider";
import { useAppStore } from "../../store/app-store";
import { initConfigFormStore, useConfigFormStore } from "./store";

const PROVIDER_OPTIONS: SelectOption[] = Object.values(BUILTIN_PROVIDERS).map((p) => ({
  name: p.name,
  description: "",
}));
const PROVIDER_IDS = Object.keys(BUILTIN_PROVIDERS);

const CONVENTIONAL_OPTIONS: TabSelectOption[] = [
  { name: "On", description: "" },
  { name: "Off", description: "" },
];

const HOME_FIELD_COUNT = 2; // provider select, conventional tab-select

export function ConfigScreen() {
  const config = useAppStore((s) => s.config);
  const models = useConfigFormStore((s) => s.models);
  const setConventional = useConfigFormStore((s) => s.setConventional);
  const setModel = useConfigFormStore((s) => s.setModel);
  const removeModel = useConfigFormStore((s) => s.removeModel);
  const closePopUp = useAppStore((s) => s.closePopUp);

  useEffect(() => {
    if (config) initConfigFormStore(config);
  }, []);

  const [providerId, setProviderId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useKeyboard((key) => {
    if (providerId) return; // detail view handles its own tabbing/escape
    if (key.name === "escape") {
      closePopUp();
      return;
    }
    if (key.name === "d" && focusIndex === 0) {
      const highlightedProviderId = PROVIDER_IDS[highlightedIndex];
      if (highlightedProviderId && models.some((m) => m.provider === highlightedProviderId)) {
        removeModel(highlightedProviderId);
      }
      return;
    }
    if (key.name !== "tab") return;
    setFocusIndex((i) => {
      if (key.shift) return i === null ? HOME_FIELD_COUNT - 1 : i === 0 ? null : i - 1;
      return i === null ? 0 : i === HOME_FIELD_COUNT - 1 ? null : i + 1;
    });
  });

  const providerOptions: SelectOption[] = PROVIDER_OPTIONS.map((opt, i) => {
    const model = models.find((m) => m.provider === PROVIDER_IDS[i]);
    if (!model) return opt;
    return {
      ...opt,
      description: i === highlightedIndex ? `${model.model} - press d to delete` : model.model,
    };
  });

  if (providerId) {
    return (
      <ProviderDetail
        providerId={providerId}
        existing={models.find((m) => m.provider === providerId) ?? null}
        onBack={() => setProviderId(null)}
        onSave={(model) => {
          setModel(providerId, model);
          setProviderId(null);
        }}
      />
    );
  }

  return (
    <box flexDirection="column" padding={1}>
      <box marginBottom={1}>
        <text>Select Provider:</text>
      </box>
      <select
        options={providerOptions}
        height={6}
        showDescription={true}
        itemSpacing={0}
        focused={focusIndex === 0}
        focusedBackgroundColor="#333333"
        onChange={(index) => setHighlightedIndex(index)}
        onSelect={(index) => setProviderId(PROVIDER_IDS[index] ?? null)}
      />

      <box marginTop={1} marginBottom={1}>
        <text>Conventional Commit:</text>
      </box>
      <tab-select
        options={CONVENTIONAL_OPTIONS}
        focused={focusIndex === 1}
        focusedBackgroundColor="#333333"
        onSelect={(index) => setConventional(index === 0)}
      />

      <box marginTop={1}>
        <text fg="#6b6b6b">Tab to navigate, Enter to select</text>
      </box>
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
    <box flexDirection="column" padding={1}>
      <text attributes={1}>{provider.name}</text>

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

      <box flexDirection="column" marginTop={1}>
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

      <box marginTop={1}>
        <text fg="#6b6b6b">Tab to navigate, Esc to go back</text>
      </box>
    </box>
  );
}
