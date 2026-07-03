import { useEffect, useRef, useState } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useAppStore, type ProviderStatus } from "@/store/app-store";
import { useKeyboardStore } from "@/store/keyboard-store";
import { useThemeStore } from "@/store/theme-store";
import { BUILTIN_PROVIDERS } from "@/lib/provider";
import { Spinner } from "./spinner";
import { info } from "localog";

const SCOPE_ID = "splash";

function ProviderEntry({
  label,
  status,
}: {
  label: string;
  status: ProviderStatus;
}) {
  const theme = useThemeStore((s) => s.theme);

  if (status === "checking") return <Spinner label={`checking ${label} ...`} />;
  if (status === "valid") {
    return (
      <text>
        <span fg={theme.semantic.success}>✓</span>
        <span fg={theme.text.muted}> {label} works</span>
      </text>
    );
  }
  return (
    <text>
      <span fg={theme.semantic.error}>✗</span>
      <span fg={theme.text.muted}> {label} invalid</span>
    </text>
  );
}

export function Splash() {
  const theme = useThemeStore((s) => s.theme);
  const config = useAppStore((s) => s.config);
  const apiValidationStatus = useAppStore((s) => s.apiValidationStatus);
  const invalidProviders = useAppStore((s) => s.invalidProviders);
  const providerStatuses = useAppStore((s) => s.providerStatuses);
  const openPopUp = useAppStore((s) => s.openPopUp);
  const setScreen = useAppStore((s) => s.setScreen);
  const checkApiKeys = useAppStore((s) => s.checkApiKeys);
  const loadConfig = useAppStore((s) => s.loadConfig);
  const scrollRef = useRef<ScrollBoxRenderable>(null);

  // Load config on mount
  useEffect(() => {
    info(`Splash: loading config`);
    loadConfig();
  }, [loadConfig]);

  // Handle initial config load and validation
  useEffect(() => {
    info(`Splash: config=${config}, status=${apiValidationStatus}`);
    if (config === null) return;
    if (!config) {
      info(`Splash: no config, opening popup and going to app`);
      openPopUp("config");
      setScreen("app");
      return;
    }
    info(`Splash: config exists, checking API keys`);
    checkApiKeys();
  }, [config, openPopUp, checkApiKeys, setScreen]);

  // Auto-proceed on all valid
  useEffect(() => {
    if (apiValidationStatus === "valid") {
      info(`Splash: all valid, going to app`);
      setScreen("app");
    }
  }, [apiValidationStatus, openPopUp, setScreen]);

  // Scroll to bottom when statuses update
  useEffect(() => {
    const ref = scrollRef.current;
    if (!ref) return;
    const id = setTimeout(() => ref.scrollTo({ x: 0, y: ref.scrollHeight }), 50);
    return () => clearTimeout(id);
  }, [providerStatuses]);

  // Track focused button for partial validation state
  const hasErrors = apiValidationStatus === "partial" || apiValidationStatus === "failed";
  const [focusedButton, setFocusedButton] = useState<"config" | "ignore">("config");

  // Keyboard handling
  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        if (apiValidationStatus !== "partial" && apiValidationStatus !== "failed") return false;
        if (key.name === "tab") {
          setFocusedButton((prev) => (prev === "config" ? "ignore" : "config"));
          return true;
        }
        if (key.name === "return") {
          if (focusedButton === "config") {
            openPopUp("config");
          } else {
            setScreen("app");
          }
          return true;
        }
        if (key.name === "escape") {
          setScreen("app");
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, [apiValidationStatus, openPopUp, setScreen, focusedButton]);

  const models = config && typeof config === "object" ? config.models : [];
  const invalidNames = invalidProviders
    .map((p) => BUILTIN_PROVIDERS[p]?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <box flexGrow={1} flexDirection="column">
      <box paddingX={3} paddingTop={2} paddingBottom={1} flexShrink={0}>
        <text fg={theme.accent.cyan} attributes={1}>
          committer
        </text>
      </box>
      <scrollbox ref={scrollRef} flexGrow={1} stickyScroll stickyStart="bottom" viewportCulling={false}>
        <box flexDirection="column" paddingX={3} paddingY={1}>
          {models.map((model, i) => (
            <box key={i} height={1}>
              <ProviderEntry
                label={`${BUILTIN_PROVIDERS[model.provider]?.name ?? model.provider} API`}
                status={providerStatuses[String(i)] ?? "checking"}
              />
            </box>
          ))}
        </box>
      </scrollbox>
      {hasErrors && (
        <box flexDirection="column" flexShrink={0}>
          <box paddingX={3} paddingY={1}>
            <text fg={theme.semantic.error}>Some providers failed: {invalidNames}</text>
          </box>
          <box paddingX={3} paddingBottom={1} flexDirection="row">
            <box
              focusable
              borderStyle="rounded"
              borderColor={focusedButton === "config" ? theme.accent.cyan : theme.bg.border}
              paddingX={2}
              marginRight={2}
            >
              <text fg={focusedButton === "config" ? theme.accent.cyan : theme.text.secondary}>Config</text>
            </box>
            <box
              focusable
              borderStyle="rounded"
              borderColor={focusedButton === "ignore" ? theme.accent.cyan : theme.bg.border}
              paddingX={2}
            >
              <text fg={focusedButton === "ignore" ? theme.accent.cyan : theme.text.secondary}>Ignore</text>
            </box>
          </box>
        </box>
      )}
    </box>
  );
}
