import { useEffect } from "react";
import { useAppStore } from "../store/app-store";
import { theme } from "../lib/theme";

export function Splash() {
  const loadConfig = useAppStore((s) => s.loadConfig);

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <box flexGrow={1} alignItems="center" justifyContent="center" flexDirection="column">
      <text fg={theme.accent.cyan} attributes={1}>
        COMMITTER
      </text>
      <text fg={theme.text.muted}>AI-powered commit messages</text>
    </box>
  );
}
