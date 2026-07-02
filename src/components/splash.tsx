import { useEffect, useState } from "react";
import { useAppStore } from "../store/app-store";
import { useKeyboardStore } from "../store/keyboard-store";
import { useThemeStore } from "../store/theme-store";
import { BUILTIN_PROVIDERS } from "../lib/provider";
import { info } from "localog";

const SCOPE_ID = "splash";

export function Splash() {
  const theme = useThemeStore((s) => s.theme);
  const config = useAppStore((s) => s.config);
  const apiValidationStatus = useAppStore((s) => s.apiValidationStatus);
  const invalidProviders = useAppStore((s) => s.invalidProviders);
  const openPopUp = useAppStore((s) => s.openPopUp);
  const setScreen = useAppStore((s) => s.setScreen);
  const checkApiKeys = useAppStore((s) => s.checkApiKeys);
  const loadConfig = useAppStore((s) => s.loadConfig);

  // Load config on mount
  useEffect(() => {
    info(`Splash: loading config`);
    loadConfig();
  }, [loadConfig]);

  // Handle initial config load and validation
  useEffect(() => {
    info(`Splash: config=${config}, status=${apiValidationStatus}`);
    if (config === null) return; // still loading
    if (!config) {
      // No config or invalid config - open config popup
      info(`Splash: no config, opening popup and going to app`);
      openPopUp("config");
      setScreen("app");
      return;
    }
    // Config exists - check API keys
    info(`Splash: config exists, checking API keys`);
    checkApiKeys();
  }, [config, openPopUp, checkApiKeys, setScreen]);

  // Handle post-validation transitions
  useEffect(() => {
    info(`Splash: validation status changed to ${apiValidationStatus}`);
    if (apiValidationStatus === "valid") {
      info(`Splash: all valid, going to app`);
      setScreen("app");
    } else if (apiValidationStatus === "failed") {
      info(`Splash: failed, opening popup`);
      openPopUp("config");
      setScreen("app");
    }
  }, [apiValidationStatus, openPopUp, setScreen]);

  // Track focused button for partial validation state
  const [focusedButton, setFocusedButton] = useState<"config" | "ignore">("config");

  // Setup keyboard handling for the buttons
  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        if (apiValidationStatus !== "partial") return false;
        if (key.name === "tab") {
          setFocusedButton((prev) => (prev === "config" ? "ignore" : "config"));
          return true;
        }
        if (key.name === "return") {
          if (focusedButton === "config") {
            openPopUp("config");
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

  // Show validation UI if partial failure (some valid, some invalid)
  if (apiValidationStatus === "partial") {
    return (
      <SplashWithActions focusedButton={focusedButton} />
    );
  }

  // Show validating state
  if (apiValidationStatus === "validating") {
    return (
      <box flexGrow={1} alignItems="center" justifyContent="center" flexDirection="column">
        <text fg={theme.accent.cyan} attributes={1}>
          COMMITTER
        </text>
        <box height={1} flexShrink={0} />
        <text fg={theme.text.muted}>Validating API keys...</text>
      </box>
    );
  }

  return (
    <box flexGrow={1} alignItems="center" justifyContent="center" flexDirection="column">
      <text fg={theme.accent.cyan} attributes={1}>
        COMMITTER
      </text>
      <text fg={theme.text.muted}>AI-powered commit messages</text>
    </box>
  );
}

function SplashWithActions({ focusedButton }: { focusedButton: "config" | "ignore" }) {
  const theme = useThemeStore((s) => s.theme);
  const openPopUp = useAppStore((s) => s.openPopUp);
  const setScreen = useAppStore((s) => s.setScreen);

  // Get the invalid provider names
  const invalidProviders = useAppStore((s) => s.invalidProviders);
  const invalidNames = invalidProviders
    .map((p) => BUILTIN_PROVIDERS[p]?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <box flexGrow={1} alignItems="center" justifyContent="center" flexDirection="column">
      <text fg={theme.accent.cyan} attributes={1}>
        COMMITTER
      </text>
      <box height={1} flexShrink={0} />
      <text fg={theme.text.muted}>Failed: {invalidNames}</text>
      <box height={1} flexShrink={0} />
      <box flexDirection="row">
        <box
          focusable
          borderStyle="rounded"
          borderColor={focusedButton === "config" ? theme.accent.cyan : theme.bg.border}
          paddingX={2}
          marginRight={2}
          onKeyDown={(key) => {
            if (key.name === "return") openPopUp("config");
          }}
          onMouseDown={() => openPopUp("config")}
        >
          <text fg={focusedButton === "config" ? theme.accent.cyan : theme.text.secondary}>Config</text>
        </box>
        <box
          focusable
          borderStyle="rounded"
          borderColor={focusedButton === "ignore" ? theme.accent.cyan : theme.bg.border}
          paddingX={2}
          onKeyDown={(key) => {
            if (key.name === "return") setScreen("app");
          }}
          onMouseDown={() => setScreen("app")}
        >
          <text fg={focusedButton === "ignore" ? theme.accent.cyan : theme.text.secondary}>Ignore</text>
        </box>
      </box>
    </box>
  );
}
