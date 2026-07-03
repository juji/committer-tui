import type { SelectOption, TextareaRenderable } from "@opentui/core";
import { useEffect, useRef, useState } from "react";
import type { Model } from "../../lib/config";
import { FENCE_INSTRUCTIONS } from "../../lib/generate";
import { BUILTIN_PROVIDERS, type ModelEntry } from "../../lib/provider";
import { useAppStore } from "../../store/app-store";
import { useKeyboardStore } from "../../store/keyboard-store";
import { useThemeStore } from "../../store/theme-store";
import { themeNames } from "../../lib/themes";
import { useConfigScrollRef } from "../../lib/config-scroll-context";
import { initConfigFormStore, useConfigFormStore } from "./store";
import { useStateRef } from "../../lib/use-state-ref";

// Tab order: 0=provider, 1=prefix, 2=suffix, 3=theme
const HOME_FIELD_COUNT = 4;
const SCOPE_ID = "config";

export function ConfigScreen() {
  const theme = useThemeStore((s) => s.theme);
  const themeName = useThemeStore((s) => s.themeName);
  const config = useAppStore((s) => s.config);
  const configScrollRef = useConfigScrollRef();
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
  const [themeHighlightedIndex, setThemeHighlightedIndex] = useState(
    Math.max(0, themeNames.indexOf(themeName))
  );

  const configuredIds = models.map((m) => m.provider);
  const unconfiguredIds = Object.keys(BUILTIN_PROVIDERS).filter((id) => !configuredIds.includes(id as Model["provider"]));
  const providerIds = [...configuredIds, ...unconfiguredIds];

  const flushTextareas = () => {
    setInstructionPrefix(prefixRef.current?.plainText ?? "");
    setInstructionSuffix(suffixRef.current?.plainText ?? "");
  };

  const stateRef = useStateRef({ focusIndex, highlightedIndex, models, providerIds, closePopUp, removeModel, moveModel });

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

  const themeOptions: SelectOption[] = themeNames.map((name) => ({
    name: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: name === themeName ? "active" : "",
  }));

  // Scroll the config popup to show the focused section
  useEffect(() => {
    if (focusIndex === null || !configScrollRef?.current) return;
    const ids = ["config-provider", "config-prefix", "config-suffix", "config-theme"];
    const childId = ids[focusIndex];
    if (childId) configScrollRef.current.scrollChildIntoView(childId);
  }, [focusIndex]);

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
        <text fg={theme.text.muted}>Tab to navigate, Enter (in textarea: Ctrl+Enter) to save field</text>
      </box>

      {/* Provider selector — index 0 */}
      <box id="config-provider" flexDirection="column" marginTop={1} marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Select Provider:</text>
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
      </box>
      <box marginTop={1}>
        <text fg={theme.text.muted}>Models are tried top to bottom. Shift+↑↓ to reorder, d to delete.</text>
      </box>

      {/* Instruction Prefix — index 1 */}
      <box id="config-prefix" flexDirection="column" marginTop={1} marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Instruction Prefix:</text>
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
      </box>

      <box marginTop={1} marginBottom={1} paddingX={1} borderStyle="rounded" borderColor={theme.bg.borderLight}>
        <text fg={theme.text.dim}>{FENCE_INSTRUCTIONS}</text>
      </box>

      {/* Instruction Suffix — index 2 */}
      <box id="config-suffix" flexDirection="column" marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Instruction Suffix:</text>
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
      </box>

      {/* Theme selector — index 3 (bottom) */}
      <box id="config-theme" flexDirection="column" marginTop={1} marginBottom={1}>
        <text fg={theme.text.primary} attributes={1}>Theme:</text>
        <select
          options={themeOptions}
          selectedIndex={themeHighlightedIndex}
          height={6}
          showDescription={true}
          itemSpacing={0}
          focused={focusIndex === 3}
          focusedBackgroundColor={theme.bg.hover}
          onChange={(index) => setThemeHighlightedIndex(index)}
          onSelect={(index) => {
            const name = index != null ? themeNames[index] : undefined;
            if (name) {
              useConfigFormStore.getState().setTheme(name);
            }
          }}
        />
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
  const theme = useThemeStore((s) => s.theme);
  const provider = BUILTIN_PROVIDERS[providerId]!;
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? "");
  const [baseURL, setBaseURL] = useState(existing?.baseURL ?? provider.defaultBaseURL ?? "");
  const [modelEntries, setModelEntries] = useState<ModelEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const fieldCount = (provider.needsApiKey === false ? 0 : 1) + (provider.needsBaseURL ? 1 : 0) + 1;

  const stateRef = useStateRef({ onBack, fieldCount });

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