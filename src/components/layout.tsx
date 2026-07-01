import type { ReactNode } from "react";
import { useAppStore } from "../store/app-store";

export function Layout({ children }: { children?: ReactNode }) {
  const screen = useAppStore((s) => s.screen);
  const config = useAppStore((s) => s.config);

  const hints = ["ctrl+c exit"];
  if (screen !== "config") hints.push("ctrl+g config");
  else if (config) hints.push("esc back");

  return (
    <box flexDirection="column" flexGrow={1}>
      <box flexGrow={1} backgroundColor="#000000">{children}</box>
      <box height={1} backgroundColor="#1e1e1e" paddingLeft={1}>
        <text fg="#6b6b6b">{hints.join("  ·  ")}</text>
      </box>
    </box>
  );
}
