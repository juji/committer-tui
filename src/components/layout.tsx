import type { ReactNode } from "react";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <box flexGrow={1} backgroundColor="#000000">{children}</box>
      <box height={1} backgroundColor="#1e1e1e" paddingLeft={1}>
        <text fg="#6b6b6b">Status</text>
      </box>
    </box>
  );
}
