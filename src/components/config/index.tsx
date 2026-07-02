import type { SelectOption, TextareaRenderable } from "@opentui/core";
import { useEffect, useRef, useState } from "react";
import type { Model } from "../../lib/config";
import { FENCE_INSTRUCTIONS } from "../../lib/generate";
import { BUILTIN_PROVIDERS, type ModelEntry } from "../../lib/provider";
import { useAppStore } from "../../store/app-store";
import { useKeyboardStore } from "../../store/keyboard-store";
import { initConfigFormStore, useConfigFormStore } from "./store";
import { theme } from "../../lib/theme";

const HOME_FIELD_COUNT = 3; // provider select, instruction prefix textarea, instruction suffix textarea
const SCOPE_ID = "config";

export function ConfigScreen() {
  const config = useAppStore((s) => s.config);
  const models = useConfigFormStore((s) => s.models);
  const instructionPrefix = useConfigFormStore((s) => s.instructionPrefix);
  const instructionSuffix = useConfigFormStore((s) => s.instructionSuffix);
  const setInstructionPrefix = useConfigFormStore((s) => s.setInstructionPrefix);
  const setInstructionSuffix = useConfigFormStore((s) => s.setInstructionSuffix);
  const setModel = useConfigFormStore((s) => s.setModel);
  const removeModel = useConfigFormStore((s) => s.removeModel);
  const moveModel = useConfigFormStore((s) => s.moveModel);
  const closePopUp = useAppStore((s) => s.closePopUp);
  const prefixRef = useRef<TextareaRenderable>(null);
  const suffixRef = useRef<TextareaRenderable>(null);

  useEffect(() => {
    if (config) initConfigFormStore(config);
  }, []);

  const [providerId, setProviderId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const configuredIds = models.map((m) => m.provider);
  const unconfiguredIds = Object.keys(BUILTIN_PROVIDERS).filter((id) => !configuredIds.includes(id as Model["provider"]));
  const providerIds = [...configuredIds, ...unconfiguredIds];

  const flushTextareas = () => {
    setInstructionPrefix(prefixRef.current?.plainText ?? "");
    setInstructionSuffix(suffixRef.current?.plainText ?? "");
  };

  const stateRef = useRef({ focusIndex, highlightedIndex, models, providerIds, closePopUp, removeModel, moveModel });
  stateRef.current = { focusIndex, highlightedIndex, models, providerIds, closePopUp, removeModel, moveModel };

  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        const s = stateRef.current;
        if (key.name === "escape") {
          flushTextareas();
          s.closePopUp();
          return true;
        }
        if (key.name === "d" && s.focusIndex === 0) {
          const highlightedProviderId = s.providerIds[s.highlightedIndex];
          if (highlightedProviderId && s.models.some((m) => m.provider === highlightedProviderId)) {
            s.removeModel(highlightedProviderId);
          }
          return true;
        }
        if (key.shift && s.focusIndex === 0 && (key.name === "up" || key.name === "down")) {
          const highlightedProviderId = s.providerIds[s.highlightedIndex];
          if (highlightedProviderId) {
            s.moveModel(highlightedProviderId, key.name === "up" ? -1 : 1);
            setHighlightedIndex((i) => (key.name === "up" ? Math.max(0, i - 1) : Math.min(s.providerIds.length - 1, i + 1)));
          }
          return true;
        }
        if (key.name !== "tab") return false;
        flushTextareas();
        setFocusIndex((i) => {
          if (key.shift) return i === null ? HOME_FIELD_COUNT - 1 : i === 0 ? null : i - 1;
          return i === null ? 0 : i === HOME_FIELD_COUNT - 1 ? null : i + 1;
        });
        return true;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, []);

  const providerOptions: SelectOption[] = providerIds.map((id, i) => {
    const provider = BUILTIN_PROVIDERS[id]!;
    const model = models.find((m) => m.provider === id);
    if (!model) return { name: provider.name, description: "" };
    return {
      name: provider.name,
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
        <text fg={theme.text.primary} attributes={1}>Select Provider:</text>
      </box>
      <select
        options={providerOptions}
        selectedIndex={highlightedIndex}
        height={6}
        showDescription={true}
        itemSpacing={0}
        focused={focusIndex === 0}
        focusedBackgroundColor={theme.bg.hover}
        onChange={(index) => setHighlightedIndex(index)}
        onSelect={(index) => setProviderId(providerIds[index] ?? null)}
      />
      <box marginTop={1}>
        <text fg={theme.text.muted}>Models are tried top to bottom. Shift+↑↓ to reorder, d to delete.</text>
      </box>

      <box marginTop={1} marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Instruction Prefix:</text>
      </box>
      <box paddingX={1} borderStyle="rounded" borderColor={focusIndex === 1 ? theme.accent.cyan : theme.bg.borderLight}>
        <textarea
          ref={prefixRef}
          initialValue={instructionPrefix}
          height={6}
          backgroundColor="transparent"
          focused={focusIndex === 1}
          onSubmit={() => setInstructionPrefix(prefixRef.current?.plainText ?? "")}
        />
      </box>

      <box marginTop={1} marginBottom={1} paddingX={1} borderStyle="rounded" borderColor={theme.bg.borderLight}>
        <text fg={theme.text.dim}>{FENCE_INSTRUCTIONS}</text>
      </box>

      <box marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Instruction Suffix:</text>
      </box>
      <box paddingX={1} borderStyle="rounded" borderColor={focusIndex === 2 ? theme.accent.cyan : theme.bg.borderLight}>
        <textarea
          ref={suffixRef}
          initialValue={instructionSuffix}
          height={6}
          backgroundColor="transparent"
          focused={focusIndex === 2}
          onSubmit={() => setInstructionSuffix(suffixRef.current?.plainText ?? "")}
        />
      </box>

      <box marginTop={1}>
        <text fg={theme.text.muted}>Tab to navigate, Enter (in textarea: Ctrl+Enter) to save field</text>
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

  const stateRef = useRef({ onBack, fieldCount });
  stateRef.current = { onBack, fieldCount };

  useEffect(() => {
    const id = "config/provider-detail";
    useKeyboardStore.getState().push({
      id,
      handleKey: (key) => {
        const s = stateRef.current;
        if (key.name === "escape") {
          s.onBack();
          return true;
        }
        if (key.name === "tab") {
          setFocusIndex((i) => {
            if (key.shift) return (i - 1 + s.fieldCount) % s.fieldCount;
            return (i + 1) % s.fieldCount;
          });
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(id);
  }, []);

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
      <text fg={theme.accent.cyan} attributes={1}>{provider.name}</text>

      {apiKeyIndex >= 0 && (
        <box flexDirection="column" marginTop={1}>
          <text fg={theme.text.secondary}>API Key</text>
          <input
            value={apiKey}
            placeholder="API key"
            focused={focusIndex === apiKeyIndex}
            focusedBackgroundColor={theme.bg.hover}
            onChange={setApiKey}
          />
        </box>
      )}

      {baseURLIndex >= 0 && (
        <box flexDirection="column" marginTop={1}>
          <text fg={theme.text.secondary}>Base URL</text>
          <input
            value={baseURL}
            placeholder={provider.defaultBaseURL ?? "Base URL"}
            focused={focusIndex === baseURLIndex}
            focusedBackgroundColor={theme.bg.hover}
            onChange={setBaseURL}
          />
        </box>
      )}

      <box flexDirection="column" marginTop={1}>
        <text fg={theme.text.secondary}>Model{error ? ` (${error})` : ""}</text>
        <select
          options={modelOptions}
          height={6}
          focused={focusIndex === modelIndex}
          focusedBackgroundColor={theme.bg.hover}
          onSelect={(_, option) => {
            if (!option) return;
            onSave({ name: provider.name, provider: providerId as Model["provider"], model: option.name, apiKey, baseURL: baseURL || undefined });
          }}
        />
      </box>

      <box marginTop={1}>
        <text fg={theme.text.muted}>Tab to navigate, Esc to go back</text>
      </box>
    </box>
  );
}
