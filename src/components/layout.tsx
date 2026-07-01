import { RGBA } from "@opentui/core";
import type { ReactNode } from "react";
import { ConfigScreen } from "./config";
import { useAppStore } from "../store/app-store";

const BACKDROP_COLOR = RGBA.fromValues(0, 0, 0, 0.6);

export function Layout({ children }: { children?: ReactNode }) {
  const config = useAppStore((s) => s.config);
  const popUpOpen = useAppStore((s) => s.popUpOpen);

  const hints = ["ctrl+c exit"];
  if (!popUpOpen) hints.push("ctrl+g config");
  else if (config) hints.push("esc back");

  return (
    <box flexDirection="column" flexGrow={1}>
      <box flexGrow={1} backgroundColor="#000000">
        {children}
        {popUpOpen === "config" && (
          <box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            backgroundColor={BACKDROP_COLOR}
            zIndex={10}
          >
            <box width={50} borderStyle="rounded" borderColor="#333333" title="Config" titleColor="#ffffff" backgroundColor="#111111" zIndex={11}>
              <ConfigScreen />
            </box>
          </box>
        )}
      </box>
      <box height={1} backgroundColor="#1e1e1e" paddingLeft={1}>
        <text fg="#6b6b6b">{hints.join("  ·  ")}</text>
      </box>
    </box>
  );
}
